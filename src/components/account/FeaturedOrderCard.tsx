import Link from "next/link";
import Icon from "@/components/store/Icon";
import OrderTimeline from "@/components/confirmation/OrderTimeline";
import { formatNaira } from "@/lib/format";
import OrderStatusBadge from "./OrderStatusBadge";
import { paymentText, type OrderSummary } from "./OrderCard";
import { formatOrderDate } from "./orderUtils";

type Props = { order: OrderSummary; shippingName: string };

/** The most recent order that is still in progress (not delivered / cancelled). */
export default function FeaturedOrderCard({ order, shippingName }: Props) {
  const placed = formatOrderDate(order.createdAt, true);
  return (
    <section aria-labelledby="active-order-heading" className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-secondary-container via-secondary to-primary-container p-1" />
      <div className="p-space-md md:p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-wrap items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <p className="font-label-caps text-label-caps uppercase text-outline tracking-wider mb-1">Active order</p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="active-order-heading" className="font-headline-sm text-headline-sm font-bold text-primary break-all">#{order.orderNumber}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <span className="font-body-sm text-body-sm text-outline mt-0.5">
              Placed {placed} · {paymentText(order.paymentMethod, order.paymentStatus)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-label-caps text-label-caps uppercase text-outline block">Order Total</span>
            <span className="font-price-xl text-price-xl font-bold text-primary">{formatNaira(order.totalKobo)}</span>
          </div>
        </div>

        <OrderTimeline status={order.status} placedAt={placed} shippingName={shippingName} etaText={`${order.itemCount} ${order.itemCount === 1 ? "item" : "items"}`} />

        <div className="space-y-2">
          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"} in this order
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {order.lines.slice(0, 6).map((l, i) => (
              <li key={`${l.name}-${i}`} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                  <Icon name="shopping_basket" className="text-xl" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-title-md text-body-sm font-bold text-on-surface truncate">{l.name}</p>
                  <p className="font-body-sm text-outline text-[12px] truncate">{l.variantLabel} · Qty {l.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Link href={`/account/orders/${order.orderNumber}`} className="inline-flex items-center gap-1 min-h-11 text-secondary hover:text-on-secondary-container font-label-md text-label-md font-bold">
            View Full Details <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}
