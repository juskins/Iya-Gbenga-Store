import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderAddress, PaymentMethod } from "@/lib/types-order";
import { getBankDetails } from "./bank";
import { sendEmail } from "./send";
import { orderEmailSubject, renderOrderHtml, renderOrderText, type EmailOrder } from "./templates";

const EMAIL_TYPE = "order_confirmation";

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  contact_email: string;
  payment_method: PaymentMethod;
  shipping_method_name: string;
  shipping_address: OrderAddress;
  note: string | null;
  subtotal_kobo: number;
  shipping_kobo: number;
  discount_kobo: number;
  total_kobo: number;
  order_items: { product_name: string; variant_label: string; unit_price_kobo: number; quantity: number }[];
};

/**
 * Emails the order confirmation and records the outcome in email_events.
 * Never throws: an email problem must not affect the order. Safe to call twice (skips if already sent).
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: sent } = await admin
      .from("email_events")
      .select("id")
      .eq("order_id", orderId)
      .eq("type", EMAIL_TYPE)
      .eq("status", "sent")
      .limit(1);
    if (sent && sent.length > 0) return;

    const { data: row, error } = await admin
      .from("orders")
      .select(
        `id, order_number, created_at, contact_email, payment_method, shipping_method_name, shipping_address, note,
         subtotal_kobo, shipping_kobo, discount_kobo, total_kobo,
         order_items(product_name, variant_label, unit_price_kobo, quantity)`,
      )
      .eq("id", orderId)
      .single<OrderRow>();
    if (error || !row) throw new Error(error?.message ?? "Order not found");

    const order: EmailOrder = {
      orderNumber: row.order_number,
      createdAt: row.created_at,
      email: row.contact_email,
      paymentMethod: row.payment_method,
      shippingMethodName: row.shipping_method_name,
      address: row.shipping_address,
      items: row.order_items.map((i) => ({
        productName: i.product_name,
        variantLabel: i.variant_label,
        unitPriceKobo: i.unit_price_kobo,
        quantity: i.quantity,
      })),
      note: row.note,
      subtotalKobo: row.subtotal_kobo,
      shippingKobo: row.shipping_kobo,
      discountKobo: row.discount_kobo,
      totalKobo: row.total_kobo,
    };

    const bank = getBankDetails();
    const result = await sendEmail({
      idempotencyKey: `${EMAIL_TYPE}/${orderId}`,
      to: order.email,
      subject: orderEmailSubject(order),
      text: renderOrderText(order, bank),
      html: renderOrderHtml(order, bank),
    });

    await admin.from("email_events").insert({
      order_id: orderId,
      type: EMAIL_TYPE,
      status: result.ok ? "sent" : "failed",
      provider_id: result.ok ? result.providerId : null,
      error: result.ok ? null : result.error.slice(0, 1000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] order confirmation failed:", message);
    try {
      await createAdminClient()
        .from("email_events")
        .insert({ order_id: orderId, type: EMAIL_TYPE, status: "failed", error: message.slice(0, 1000) });
    } catch {
      /* logging is best effort */
    }
  }
}
