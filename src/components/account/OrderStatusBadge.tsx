import type { OrderStatus } from "@/lib/types-order";
import { STATUS_LABELS } from "./orderUtils";

const tones: Record<OrderStatus, string> = {
  pending: "bg-secondary-fixed text-on-secondary-fixed",
  confirmed: "bg-primary-fixed text-on-primary-fixed",
  packing: "bg-primary-fixed text-on-primary-fixed",
  dispatched: "bg-primary-fixed text-on-primary-fixed",
  delivered: "bg-tertiary text-on-tertiary",
  cancelled: "bg-error-container text-on-error-container",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-caps text-label-caps font-bold uppercase tracking-wider ${tones[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
