"use server";

import { after } from "next/server";
import { ORDER_NOTE_MAX } from "@/lib/config";
import { sendOrderConfirmationEmail } from "@/lib/email/orderConfirmation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  placeOrderSchema,
  toE164,
  type CheckoutValues,
  type PlaceOrderInput,
  type PlaceOrderResult,
} from "@/lib/validators/checkout";

const RATE_LIMIT_ORDERS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const fail = (code: string, message: string): PlaceOrderResult => ({ ok: false, code, message });

/** Strips control characters (newlines become spaces), trims and caps the length. */
const clean = (v: string, max: number) =>
  v
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

type VariantInfo = { label: string; stock_qty: number; max_per_order: number; product: { name: string } | { name: string }[] | null };

/** Looks the variant up so errors can name the product. Best effort. */
async function describeVariant(variantId: string) {
  const { data } = await createAdminClient()
    .from("product_variants")
    .select("label, stock_qty, max_per_order, product:products(name)")
    .eq("id", variantId)
    .maybeSingle<VariantInfo>();
  if (!data) return null;
  const product = Array.isArray(data.product) ? data.product[0] : data.product;
  return {
    name: product ? `${product.name} (${data.label})` : data.label,
    stock: data.stock_qty,
    max: data.max_per_order,
  };
}

async function mapRpcError(rawMessage: string): Promise<PlaceOrderResult> {
  const match = /^([A-Z_]+)(?::([0-9a-fA-F-]{36}))?/.exec(rawMessage.trim());
  const code = match?.[1] ?? "UNKNOWN";
  const variantId = match?.[2];
  const info = variantId ? await describeVariant(variantId) : null;
  const name = info?.name ?? "One of the items in your basket";

  switch (code) {
    case "EMPTY_CART":
      return fail(code, "Your basket is empty. Add some groceries before placing an order.");
    case "INVALID_QUANTITY":
      return fail(code, "One of the quantities in your basket is not valid. Please update your basket and try again.");
    case "OUT_OF_STOCK":
      return fail(
        code,
        info
          ? info.stock > 0
            ? `Sorry, only ${info.stock} of ${name} ${info.stock === 1 ? "is" : "are"} left. Please lower the quantity in your basket.`
            : `Sorry, ${name} is out of stock. Please remove it from your basket to continue.`
          : `${name} is not available in the quantity you chose. Please update your basket.`,
      );
    case "MAX_PER_ORDER":
      return fail(
        code,
        info
          ? `You can order at most ${info.max} of ${name} at a time. Please lower the quantity in your basket.`
          : `${name} exceeds the maximum quantity per order. Please lower the quantity in your basket.`,
      );
    case "VARIANT_UNAVAILABLE":
      return fail(code, `${name} is no longer available. Please remove it from your basket to continue.`);
    case "SHIPPING_UNAVAILABLE":
      return fail(code, "That shipping method is no longer available. Please choose another one.");
    case "INVALID_PAYMENT_METHOD":
      return fail(code, "Please choose a valid payment method.");
    case "IDEMPOTENCY_KEY_CONFLICT":
      return fail(code, "We could not process that submission. Please try placing your order again.");
    default:
      return fail("UNKNOWN", "We could not place your order. Your basket and details are saved. Please try again.");
  }
}

/** Runs after a successful order. Failures here must never affect the order. */
async function saveDefaultAddress(userId: string, values: CheckoutValues, address: Record<string, string>) {
  try {
    const supabase = await createClient();
    const phone = address.phone;

    await supabase.from("profiles").update({ full_name: address.recipient, phone }).eq("id", userId);

    const row = {
      recipient: address.recipient,
      phone,
      street: address.street,
      unit: address.unit || null,
      state: values.state,
      lga: address.lga,
      landmark: address.landmark || null,
    };
    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();
    if (existing) await supabase.from("addresses").update(row).eq("id", existing.id);
    else await supabase.from("addresses").insert({ ...row, user_id: userId, is_default: true });
  } catch (err) {
    console.error("[checkout] saving default address failed:", err instanceof Error ? err.message : err);
  }
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  // 1. Re-validate with the same schema the form uses.
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: NonNullable<Extract<PlaceOrderResult, { ok: false }>["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "values" && typeof issue.path[1] === "string") {
        fieldErrors[issue.path[1] as keyof CheckoutValues] ??= issue.message;
      }
    }
    const itemsIssue = parsed.error.issues.find((i) => i.path[0] === "items");
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: itemsIssue ? "Your basket is empty or invalid." : "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }
  const { values, idempotencyKey, items, note } = parsed.data;

  // 2. Never trust a client-supplied user id: use the session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHENTICATED", "Please sign in to place your order.");

  const admin = createAdminClient();

  // 3. Rate limit (a retry of an order that already exists is not counted).
  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_ORDERS) {
      return fail("RATE_LIMITED", "You have placed several orders in the last few minutes. Please wait a little before ordering again.");
    }
  }

  // 4. Create the order. The database prices everything.
  const address = {
    recipient: clean(`${values.firstName} ${values.lastName}`, 121),
    phone: toE164(values.phone),
    street: clean(values.street, 150),
    unit: clean(values.unit, 100),
    state: values.state,
    lga: values.lga,
    landmark: clean(values.landmark, 250),
  };

  const { data, error } = await admin.rpc("create_order", {
    p_user_id: user.id,
    p_idempotency_key: idempotencyKey,
    p_items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
    p_shipping_method_id: values.shippingMethod,
    p_payment_method: values.paymentMethod,
    p_address: address,
    p_contact_email: values.email.trim().toLowerCase(),
    p_contact_phone: address.phone,
    p_note: clean(note, ORDER_NOTE_MAX),
  });

  if (error) {
    console.error("[checkout] create_order failed:", error.message);
    return mapRpcError(error.message);
  }

  const created = (Array.isArray(data) ? data[0] : data) as { order_id: string; order_number: string } | undefined;
  if (!created?.order_number) return fail("UNKNOWN", "We could not place your order. Please try again.");

  // 5. Best-effort follow-ups: neither may fail the order.
  if (values.saveAsDefault) await saveDefaultAddress(user.id, values, address);
  try {
    after(() => sendOrderConfirmationEmail(created.order_id));
  } catch {
    void sendOrderConfirmationEmail(created.order_id);
  }

  return { ok: true, orderNumber: created.order_number };
}
