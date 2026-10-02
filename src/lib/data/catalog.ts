import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product, Variant } from "@/lib/types";

type Tone = NonNullable<Product["badge"]>["tone"];

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  origin: string | null;
  badge: string | null;
  badge_tone: Tone | null;
  created_at: string;
  category: { slug: string; name: string } | null;
  variants: {
    id: string;
    label: string;
    sku: string;
    price_kobo: number;
    compare_at_price_kobo: number | null;
    stock_qty: number;
    max_per_order: number;
  }[];
  images: { url: string; sort_order: number }[];
  related: { related_product_id: string }[];
};

/** Cookie-less anon client: public catalog reads are allowed by RLS and safe to cache across users. */
function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await publicClient()
    .from("products")
    .select(
      `id, name, slug, description, origin, badge, badge_tone, created_at,
       category:categories(slug, name),
       variants:product_variants(id, label, sku, price_kobo, compare_at_price_kobo, stock_qty, max_per_order),
       images:product_images(url, sort_order),
       related:product_related!product_related_product_id_fkey(related_product_id)`,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) throw new Error(`Failed to load catalog: ${error.message}`);

  const slugById = new Map(data.map((r) => [r.id, r.slug]));

  return data
    .filter((r) => r.category && r.variants.length > 0)
    .map((r): Product => {
      const variants: Variant[] = [...r.variants]
        .sort((a, b) => a.price_kobo - b.price_kobo)
        .map((v) => ({
          id: v.id,
          label: v.label,
          sku: v.sku,
          priceKobo: v.price_kobo,
          compareAtPriceKobo: v.compare_at_price_kobo ?? undefined,
          stockQty: v.stock_qty,
          maxPerOrder: v.max_per_order,
        }));
      return {
        slug: r.slug,
        name: r.name,
        categorySlug: r.category!.slug,
        categoryLabel: r.category!.name,
        origin: r.origin ?? "",
        badge: r.badge && r.badge_tone ? { text: r.badge, tone: r.badge_tone } : undefined,
        description: r.description,
        images: [...r.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url),
        variants,
        relatedSlugs: r.related.map((x) => slugById.get(x.related_product_id)).filter((s): s is string => !!s),
        createdAt: r.created_at,
      };
    })
    .filter((p) => p.images.length > 0);
}

/** All active products, cached for 60s. Tag "catalog" lets stock/price edits revalidate on demand. */
export const getAllProducts = unstable_cache(fetchAllProducts, ["catalog-all-products"], {
  revalidate: 60,
  tags: ["catalog"],
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const all = await getAllProducts();
  return product.relatedSlugs
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Product => !!p)
    .slice(0, limit);
}

export type ShippingMethod = {
  id: string;
  name: string;
  priceKobo: number;
  freeAboveKobo: number | null;
  etaText: string;
  cutoffTime: string | null;
};

async function fetchShippingMethods(): Promise<ShippingMethod[]> {
  const { data, error } = await publicClient()
    .from("shipping_methods")
    .select("id, name, price_kobo, free_above_kobo, eta_text, cutoff_time")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(`Failed to load shipping methods: ${error.message}`);
  return data.map((m) => ({
    id: m.id,
    name: m.name,
    priceKobo: m.price_kobo,
    freeAboveKobo: m.free_above_kobo,
    etaText: m.eta_text,
    cutoffTime: m.cutoff_time,
  }));
}

export const getShippingMethods = unstable_cache(fetchShippingMethods, ["shipping-methods"], {
  revalidate: 300,
  tags: ["shipping"],
});
