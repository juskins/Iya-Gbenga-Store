import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderAddress, OrderView, PaymentMethod } from "@/lib/types-order";

type Row = {
  order_number: string;
  created_at: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal_kobo: number;
  shipping_kobo: number;
  discount_kobo: number;
  total_kobo: number;
  shipping_address: Partial<OrderAddress>;
  shipping_method_name: string;
  contact_email: string;
  contact_phone: string;
  note: string | null;
  order_items: {
    id: string;
    product_name: string;
    variant_label: string;
    unit_price_kobo: number;
    quantity: number;
    variant: { product: { images: { url: string; sort_order: number }[] | null } | null } | null;
  }[];
  order_events: { status: string; note: string | null; created_at: string }[];
};

/**
 * Loads one order for the signed-in user via the user-scoped client (RLS: owners only).
 * Also filters on user_id so admin read policies never leak another customer's order here.
 * Returns null when it does not exist or is not the caller's.
 */
export async function getOrderForUser(orderNumber: string, userId: string): Promise<OrderView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `order_number, created_at, status, payment_method, payment_status,
       subtotal_kobo, shipping_kobo, discount_kobo, total_kobo,
       shipping_address, shipping_method_name, contact_email, contact_phone, note,
       order_items(id, product_name, variant_label, unit_price_kobo, quantity,
         variant:product_variants(product:products(images:product_images(url, sort_order)))),
       order_events(status, note, created_at)`,
    )
    .eq("order_number", orderNumber)
    .eq("user_id", userId)
    .maybeSingle<Row>();

  if (error || !data) return null;

  const a = data.shipping_address ?? {};
  return {
    orderNumber: data.order_number,
    createdAt: data.created_at,
    status: data.status,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    email: data.contact_email,
    phone: data.contact_phone,
    address: {
      recipient: a.recipient ?? "",
      phone: a.phone ?? data.contact_phone,
      street: a.street ?? "",
      unit: a.unit ?? "",
      state: a.state ?? "",
      lga: a.lga ?? "",
      landmark: a.landmark ?? "",
    },
    items: data.order_items.map((i) => {
      const images = [...(i.variant?.product?.images ?? [])].sort((x, y) => x.sort_order - y.sort_order);
      return {
        id: i.id,
        productName: i.product_name,
        variantLabel: i.variant_label,
        unitPriceKobo: i.unit_price_kobo,
        quantity: i.quantity,
        image: images[0]?.url ?? null,
      };
    }),
    note: data.note,
    shippingMethodName: data.shipping_method_name,
    subtotalKobo: data.subtotal_kobo,
    shippingKobo: data.shipping_kobo,
    discountKobo: data.discount_kobo,
    totalKobo: data.total_kobo,
    events: [...data.order_events]
      .sort((x, y) => x.created_at.localeCompare(y.created_at))
      .map((e) => ({ status: e.status, note: e.note, createdAt: e.created_at })),
  };
}
