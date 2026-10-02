import Link from "next/link";
import Icon from "@/components/store/Icon";
import { formatNaira } from "@/lib/format";
import { PAYMENT_LABELS, type OrderStatus, type PaymentMethod } from "@/lib/types-order";
import OrderStatusBadge from "./OrderStatusBadge";
import ReorderButton, { type ReorderLine } from "./ReorderButton";
import { formatOrderDate } from "./orderUtils";

export type OrderSummary = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  itemCount: number;
  totalKobo: number;
  itemNames: string[];
  lines: ReorderLine[];
};

export function paymentText(method: PaymentMethod, paymentStatus: string) {
  return `${PAYMENT_LABELS[method] ?? method} (${paymentStatus === "paid" ? "paid" : "payment pending"})`;
}

const MAX_CHIPS = 4;

export default function OrderCard({ order }: { order: OrderSummary }) {
  const cancelled = order.status === "cancelled";
  const delivered = order.status === "delivered";
  const icon = cancelled ? "close" : delivered ? "done_all" : "local_shipping";
  const iconTone = cancelled
    ? "bg-error-container text-error"
    : delivered
      ? "bg-tertiary-fixed/50 text-tertiary"
      : "bg-primary-fixed/50 text-primary";
  const chips = order.itemNames.slice(0, MAX_CHIPS);
  const extra = order.itemNames.length - chips.length;
  const detailsHref = `/account/orders/${order.orderNumber}`;

  return (
    <li className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-sm">
      <div className="flex flex-wrap items-start justify-between gap-space-sm">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${iconTone}`}>
            <Icon name={icon} className="text-xl" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-title-md text-title-md font-bold text-on-surface break-all">#{order.orderNumber}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-0.5">
              {formatOrderDate(order.createdAt)} · {paymentText(order.paymentMethod, order.paymentStatus)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`font-title-md text-title-md font-bold ${cancelled ? "text-outline line-through" : "text-on-surface"}`}>
            {formatNaira(order.totalKobo)}
          </span>
          <p className="font-body-sm text-[12px] text-outline">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Items in this order">
        {chips.map((name, i) => (
          <li key={`${name}-${i}`} className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-full bg-surface-container-low font-body-sm text-body-sm text-on-surface">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-on-surface shrink-0" />
            <span className="truncate">{name}</span>
          </li>
        ))}
        {extra > 0 && (
          <li className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant">+{extra} more</li>
        )}
      </ul>

      <div className="flex flex-wrap items-start justify-between gap-3">
        {cancelled ? <span /> : <ReorderButton lines={order.lines} label={`Reorder All ${order.lines.length} ${order.lines.length === 1 ? "Item" : "Items"}`} />}
        <Link href={detailsHref} className="inline-flex items-center gap-1 min-h-11 text-secondary hover:text-on-secondary-container font-label-md text-label-md font-bold">
          View details <Icon name="arrow_forward" className="text-base" />
        </Link>
      </div>
    </li>
  );
}
