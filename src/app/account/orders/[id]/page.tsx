import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/store/Icon";
import OrderTimeline from "@/components/confirmation/OrderTimeline";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import ReorderButton from "@/components/account/ReorderButton";
import { buildReorderLines, indexVariants } from "@/components/account/reorder";
import { asStatus, formatOrderDate } from "@/components/account/orderUtils";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/data/catalog";
import { formatNaira } from "@/lib/format";
import { PAYMENT_LABELS, type PaymentMethod } from "@/lib/types-order";

export const metadata: Metadata = { title: "Order Details" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_NUMBER = /^[A-Za-z0-9-]{3,40}$/;

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal_kobo: number;
  shipping_kobo: number;
  discount_kobo: number;
  total_kobo: number;
  shipping_address: Record<string, unknown>;
  shipping_method_name: string;
  contact_email: string;
  contact_phone: string;
  note: string | null;
  created_at: string;
  order_items: {
    id: string;
    variant_id: string | null;
    product_name: string;
    variant_label: string;
    unit_price_kobo: number;
    quantity: number;
  }[];
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const card = "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm";

export default async function OrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id: rawId } = await params;
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    notFound();
  }
  const isUuid = UUID.test(id);
  if (!isUuid && !ORDER_NUMBER.test(id)) notFound();

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, subtotal_kobo, shipping_kobo, discount_kobo, total_kobo, shipping_address, shipping_method_name, contact_email, contact_phone, note, created_at, order_items(id, variant_id, product_name, variant_label, unit_price_kobo, quantity)",
    )
    .eq(isUuid ? "id" : "order_number", id)
    .maybeSingle<OrderRow>();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!order) notFound();

  // Current catalog data, matched by variant id, used for images and reorder (never old prices).
  const products = await getAllProducts();
  const byVariant = indexVariants(products);

  const status = asStatus(order.status);
  const addr = order.shipping_address ?? {};
  const addressLines = [
    str(addr.street),
    str(addr.unit),
    [str(addr.lga), str(addr.state)].filter(Boolean).join(", "),
    str(addr.landmark) && `Landmark: ${str(addr.landmark)}`,
  ].filter(Boolean);
  const recipient = str(addr.recipient) || str(addr.full_name);
  const phone = str(addr.phone) || order.contact_phone;

  const lines = buildReorderLines(order.order_items, byVariant);

  const paymentStatus = order.payment_status === "paid" ? "Paid" : "Payment pending";

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl mx-auto w-full">
      <Link href="/account/orders" className="inline-flex items-center gap-1 min-h-11 text-primary font-label-md text-label-md font-bold w-fit">
        <Icon name="arrow_back" className="text-lg" /> All orders
      </Link>

      <section className={`${card} flex flex-col sm:flex-row sm:items-center justify-between gap-space-md`}>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold break-all">Order #{order.order_number}</h1>
            <OrderStatusBadge status={status} />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Placed {formatOrderDate(order.created_at, true)}</p>
        </div>
        <ReorderButton lines={lines} />
      </section>

      {status === "cancelled" ? (
        <section className={`${card} flex items-center gap-3`}>
          <Icon name="cancel" className="text-2xl text-error" />
          <p className="font-body-md text-body-md text-on-surface">This order was cancelled.</p>
        </section>
      ) : (
        <OrderTimeline
          status={status}
          placedAt={formatOrderDate(order.created_at, true)}
          shippingName={order.shipping_method_name}
          etaText={paymentStatus}
        />
      )}

      <section className={`${card} flex flex-col gap-space-md`} aria-labelledby="items-heading">
        <h2 id="items-heading" className="font-headline-sm text-headline-sm text-primary font-bold">Items</h2>
        <ul className="flex flex-col divide-y divide-outline-variant">
          {order.order_items.map((item) => {
            const match = item.variant_id ? byVariant.get(item.variant_id) : undefined;
            const image = match?.product.images[0];
            return (
              <li key={item.id} className="flex items-center gap-space-md py-3 first:pt-0 last:pb-0">
                <div className="relative w-16 h-16 rounded-lg bg-surface-container-low shrink-0 overflow-hidden flex items-center justify-center">
                  {image ? (
                    <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <Icon name="shopping_basket" className="text-2xl text-outline" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-title-md text-title-md text-on-surface font-bold">{item.product_name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.variant_label} · {formatNaira(item.unit_price_kobo)} × {item.quantity}
                  </p>
                </div>
                <span className="font-title-md text-title-md text-on-surface font-bold">{formatNaira(item.unit_price_kobo * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="border-t border-outline-variant pt-space-md flex flex-col gap-2 font-body-md text-body-md">
          <div className="flex justify-between"><dt className="text-on-surface-variant">Subtotal</dt><dd>{formatNaira(order.subtotal_kobo)}</dd></div>
          <div className="flex justify-between"><dt className="text-on-surface-variant">Shipping</dt><dd>{order.shipping_kobo === 0 ? "Free" : formatNaira(order.shipping_kobo)}</dd></div>
          {order.discount_kobo > 0 && (
            <div className="flex justify-between"><dt className="text-on-surface-variant">Discount</dt><dd>-{formatNaira(order.discount_kobo)}</dd></div>
          )}
          <div className="flex justify-between font-bold text-primary font-title-md text-title-md"><dt>Total</dt><dd>{formatNaira(order.total_kobo)}</dd></div>
        </dl>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        <section className={`${card} flex flex-col gap-2`} aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="font-title-md text-title-md text-primary font-bold">Delivery address</h2>
          <address className="not-italic font-body-md text-body-md text-on-surface flex flex-col gap-0.5">
            {recipient && <span className="font-bold">{recipient}</span>}
            {addressLines.map((l) => <span key={l}>{l}</span>)}
            {phone && <span>{phone}</span>}
          </address>
        </section>
        <section className={`${card} flex flex-col gap-2`} aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="font-title-md text-title-md text-primary font-bold">Shipping method</h2>
          <p className="font-body-md text-body-md text-on-surface">{order.shipping_method_name}</p>
        </section>
        <section className={`${card} flex flex-col gap-2`} aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="font-title-md text-title-md text-primary font-bold">Payment</h2>
          <p className="font-body-md text-body-md text-on-surface">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{paymentStatus}</p>
        </section>
      </div>

      {order.note && (
        <section className={`${card} flex flex-col gap-2`}>
          <h2 className="font-title-md text-title-md text-primary font-bold">Your note</h2>
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{order.note}</p>
        </section>
      )}
    </div>
  );
}
