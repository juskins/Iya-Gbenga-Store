import type { OrderStatus } from "@/lib/types-order";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packing: "Packing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function asStatus(value: string): OrderStatus {
  return value in STATUS_LABELS ? (value as OrderStatus) : "pending";
}

const TZ = "Africa/Lagos";

export function formatOrderDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: TZ,
  });
}
