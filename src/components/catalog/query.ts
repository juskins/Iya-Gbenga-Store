import type { Product } from "@/lib/types";
import { startingPrice } from "@/lib/product-utils";

/** URL-backed catalog state. Pure helpers, usable from server and client components. */
export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
] as const;
export type SortValue = (typeof SORTS)[number]["value"];

export const LIMITS = [12, 24, 48] as const;
export const DEFAULT_LIMIT = 12;
/** Upper end of the price slider, in naira. */
export const PRICE_CEILING = 20000;
export const PRICE_STEP = 500;

export type StockValue = "in" | "out";

export type CatalogState = {
  q: string;
  categories: string[];
  /** Naira. */
  minPrice?: number;
  maxPrice?: number;
  stock: StockValue[];
  sort: SortValue;
  page: number;
  limit: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const posInt = (s: string) => (/^\d+$/.test(s) ? Number(s) : undefined);

export function parseState(raw: RawParams): CatalogState {
  const [lo, hi] = first(raw.price).split("-");
  const sort = SORTS.find((s) => s.value === first(raw.sort))?.value ?? "featured";
  const limit = Number(first(raw.limit));
  return {
    q: first(raw.q).trim().slice(0, 100),
    categories: [...new Set(list(raw.category))],
    minPrice: posInt(lo ?? ""),
    maxPrice: posInt(hi ?? ""),
    stock: [...new Set(list(raw.stock).filter((s): s is StockValue => s === "in" || s === "out"))],
    sort,
    page: Math.max(1, posInt(first(raw.page)) ?? 1),
    limit: (LIMITS as readonly number[]).includes(limit) ? limit : DEFAULT_LIMIT,
  };
}

/** Build `/groceries?...` omitting defaults. `patch` keys reset the page unless `page` is given. */
export function buildHref(state: CatalogState, patch: Partial<CatalogState> = {}): string {
  const s: CatalogState = { ...state, page: "page" in patch ? state.page : 1, ...patch };
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  s.categories.forEach((c) => p.append("category", c));
  if (s.minPrice !== undefined || s.maxPrice !== undefined) p.set("price", `${s.minPrice ?? 0}-${s.maxPrice ?? ""}`);
  s.stock.forEach((v) => p.append("stock", v));
  if (s.sort !== "featured") p.set("sort", s.sort);
  if (s.limit !== DEFAULT_LIMIT) p.set("limit", String(s.limit));
  if (s.page > 1) p.set("page", String(s.page));
  const qs = p.toString();
  return qs ? `/groceries?${qs}` : "/groceries";
}

export function activeFilterCount(s: CatalogState): number {
  return s.categories.length + (s.minPrice !== undefined || s.maxPrice !== undefined ? 1 : 0) + (s.stock.length === 1 ? 1 : 0);
}

const isInStock = (p: Product) => p.variants.some((v) => v.stockQty > 0);

export function matchesSearch(p: Product, q: string, categoryName: string): boolean {
  const hay = `${p.name} ${p.description} ${p.categoryLabel} ${categoryName}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => hay.includes(t));
}

export function filterProducts(all: Product[], s: CatalogState, categoryNames: Record<string, string>): Product[] {
  return all.filter((p) => {
    if (s.q && !matchesSearch(p, s.q, categoryNames[p.categorySlug] ?? "")) return false;
    if (s.categories.length && !s.categories.includes(p.categorySlug)) return false;
    const price = startingPrice(p) / 100;
    if (s.minPrice !== undefined && price < s.minPrice) return false;
    if (s.maxPrice !== undefined && price > s.maxPrice) return false;
    if (s.stock.length === 1 && isInStock(p) !== (s.stock[0] === "in")) return false;
    return true;
  });
}

export function sortProducts(items: Product[], sort: SortValue): Product[] {
  const out = [...items];
  if (sort === "price-asc") out.sort((a, b) => startingPrice(a) - startingPrice(b));
  else if (sort === "price-desc") out.sort((a, b) => startingPrice(b) - startingPrice(a));
  else if (sort === "newest") out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out; // "featured" keeps curated order
}

export { isInStock };
