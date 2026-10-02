import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/store/Icon";
import OrderCard, { type OrderSummary } from "@/components/account/OrderCard";
import FeaturedOrderCard from "@/components/account/FeaturedOrderCard";
import OrdersPagination from "@/components/account/OrdersPagination";
import OrdersSidebar, { type Staple } from "@/components/account/OrdersSidebar";
import OrdersToolbar, { FILTERS, ordersHref, type StatusFilter } from "@/components/account/OrdersToolbar";
import { asStatus } from "@/components/account/orderUtils";
import { buildReorderLines, indexVariants, type OrderItemRow } from "@/components/account/reorder";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/data/catalog";
import type { PaymentMethod } from "@/lib/types-order";

export const metadata: Metadata = { title: "My Orders" };

const PAGE_SIZE = 10;
const GROUPS: Record<Exclude<StatusFilter, "all">, string[]> = {
  "in-transit": ["confirmed", "packing", "dispatched"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};
const ACTIVE = ["pending", "confirmed", "packing", "dispatched"];

type Row = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: string;
  total_kobo: number;
  shipping_method_name: string;
  order_items: OrderItemRow[];
};

const COLUMNS =
  "id, order_number, created_at, status, payment_method, payment_status, total_kobo, shipping_method_name, order_items(variant_id, product_name, variant_label, quantity)";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const sp = await searchParams;
  const rawPage = first(sp.page);
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (!Number.isInteger(page) || page < 1) notFound();
  const q = (first(sp.q) ?? "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 40);
  const rawStatus = first(sp.status);
  const status: StatusFilter = FILTERS.some((f) => f.key === rawStatus) ? (rawStatus as StatusFilter) : "all";

  const supabase = await createClient();
  const [{ data: userData }, { data: statusRows, error: statusError }, products] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("orders").select("status").returns<{ status: string }[]>(),
    getAllProducts(),
  ]);
  if (statusError) throw new Error(`Failed to load orders: ${statusError.message}`);

  const meta = userData.user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const fullName = meta?.full_name || meta?.name || "";

  const counts: Record<StatusFilter, number> = { all: 0, "in-transit": 0, delivered: 0, cancelled: 0 };
  for (const r of statusRows ?? []) {
    counts.all += 1;
    for (const key of Object.keys(GROUPS) as (keyof typeof GROUPS)[]) if (GROUPS[key].includes(r.status)) counts[key] += 1;
  }

  const index = indexVariants(products);
  const toSummary = (o: Row): OrderSummary => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    status: asStatus(o.status),
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    itemCount: o.order_items.reduce((n, i) => n + i.quantity, 0),
    totalKobo: o.total_kobo,
    itemNames: o.order_items.map((i) => i.product_name),
    lines: buildReorderLines(o.order_items, index),
  });

  // Featured: most recent in-progress order (only on the unfiltered first page, or In Transit).
  let featured: Row | null = null;
  if (counts.all > 0 && page === 1 && !q && (status === "all" || status === "in-transit")) {
    const { data } = await supabase
      .from("orders")
      .select(COLUMNS)
      .in("status", status === "all" ? ACTIVE : GROUPS["in-transit"])
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<Row[]>();
    featured = data?.[0] ?? null;
  }

  // Search by order number or product name (RLS scopes both queries to this user).
  let matchFilter: string | null = null;
  if (q) {
    const { data: hits } = await supabase.from("order_items").select("order_id").ilike("product_name", `%${q}%`).limit(200);
    const ids = [...new Set((hits ?? []).map((h: { order_id: string }) => h.order_id))];
    matchFilter = `order_number.ilike."%${q}%"${ids.length ? `,id.in.(${ids.join(",")})` : ""}`;
  }

  const from = (page - 1) * PAGE_SIZE;
  let query = supabase.from("orders").select(COLUMNS, { count: "exact" });
  if (status !== "all") query = query.in("status", GROUPS[status]);
  if (featured) query = query.neq("id", featured.id);
  if (matchFilter) query = query.or(matchFilter);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
    .returns<Row[]>();
  if (error && error.code === "PGRST103" && page > 1) notFound();
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  const total = count ?? 0;
  if (page > 1 && (data ?? []).length === 0) notFound();

  const past = (data ?? []).map(toSummary);

  // Fast reorder staples: most frequently ordered variants that are still in stock.
  const { data: itemRows } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .not("variant_id", "is", null)
    .limit(300)
    .returns<{ variant_id: string; quantity: number }[]>();
  const freq = new Map<string, number>();
  for (const r of itemRows ?? []) freq.set(r.variant_id, (freq.get(r.variant_id) ?? 0) + 1);
  const staples: Staple[] = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => index.get(id))
    .filter((m): m is Staple => !!m && m.variant.stockQty > 0)
    .slice(0, 4);

  const hrefFor = (p: number) => ordersHref({ q, status, page: p });

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-space-sm">
          <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/">Home</Link>
          <span aria-hidden="true" className="text-outline text-body-sm">/</span>
          <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/account/orders">Account</Link>
          <span aria-hidden="true" className="text-outline text-body-sm">/</span>
          <span aria-current="page" className="font-body-sm text-body-sm font-semibold text-primary">Orders</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">My Orders &amp; Purchases</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
              {fullName ? `Review and track your grocery orders, ${fullName}.` : "Review and track your grocery orders."}
            </p>
          </div>
          <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary">
              <Icon name="local_mall" className="text-2xl" />
            </div>
            <div>
              <div className="font-label-caps text-label-caps text-outline uppercase">Total Orders</div>
              <div className="font-title-md text-title-md font-bold text-on-surface">{counts.all}</div>
            </div>
          </div>
        </div>
      </div>

      <OrdersToolbar q={q} status={status} counts={counts} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {counts.all === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm">
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary mb-space-md">
                  <Icon name="receipt_long" className="text-4xl" />
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">No orders yet</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  When you place an order, it will show up here so you can track it and reorder in a tap.
                </p>
                <Link
                  href="/groceries"
                  className="inline-flex items-center justify-center min-h-11 bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-full hover:bg-primary-container transition-all shadow-md"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <>
              {featured && <FeaturedOrderCard order={toSummary(featured)} shippingName={featured.shipping_method_name} />}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-space-sm">
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Past Grocery Orders</h2>
                <span className="font-body-sm text-body-sm text-outline">{total} {total === 1 ? "order" : "orders"}</span>
              </div>

              {past.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm flex flex-col items-center gap-3">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {q || status !== "all" ? "No orders match your search or filter." : "No past orders yet."}
                  </p>
                  {(q || status !== "all") && (
                    <Link href="/account/orders" className="inline-flex items-center justify-center min-h-11 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold">
                      Clear filters
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="flex flex-col gap-space-md">
                  {past.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </ul>
              )}
              <OrdersPagination page={page} pageCount={Math.ceil(total / PAGE_SIZE)} total={total} hrefFor={hrefFor} />
            </>
          )}
        </div>
        <div className="lg:col-span-4 min-w-0">
          <OrdersSidebar staples={staples} />
        </div>
      </div>
    </div>
  );
}
