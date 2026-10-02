import Link from "next/link";
import Icon from "@/components/store/Icon";

export type StatusFilter = "all" | "in-transit" | "delivered" | "cancelled";

export const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "in-transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export function ordersHref(params: { q?: string; status?: StatusFilter; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/account/orders?${qs}` : "/account/orders";
}

type Props = { q: string; status: StatusFilter; counts: Record<StatusFilter, number> };

export default function OrdersToolbar({ q, status, counts }: Props) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
      <div className="flex flex-col lg:flex-row gap-space-sm items-stretch lg:items-center justify-between">
        <form action="/account/orders" role="search" className="relative flex-1 lg:max-w-md">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={40}
            aria-label="Search orders by order number or product"
            placeholder="Search order # or product (e.g. Palm oil)..."
            className="w-full min-h-11 pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </form>
        <nav aria-label="Filter orders by status" className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-1 px-1">
          {FILTERS.map((f) => {
            const active = f.key === status;
            return (
              <Link
                key={f.key}
                href={ordersHref({ q, status: f.key })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center min-h-11 px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
                  active ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {f.label} ({counts[f.key]})
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
