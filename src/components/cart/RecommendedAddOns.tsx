"use client";

import type { Product } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import ProductCard from "@/components/store/ProductCard";

const MAX_ADD_ONS = 3;

export default function RecommendedAddOns({ products }: { products: Product[] }) {
  const items = useAppSelector((s) => s.cart.items);
  const inCart = new Set(items.map((i) => i.productSlug));

  // Prefer related products of what is in the cart, then fall back to the rest of the catalog.
  const relatedSlugs = items.flatMap((i) => products.find((p) => p.slug === i.productSlug)?.relatedSlugs ?? []);
  const ordered = [...new Set([...relatedSlugs, ...products.map((p) => p.slug)])];
  const picks = ordered
    .filter((slug) => !inCart.has(slug))
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p && p.variants.some((v) => v.stockQty > 0))
    .slice(0, MAX_ADD_ONS);

  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="add-ons-heading" className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
      <div className="mb-space-md">
        <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest block">
          Recommended add-ons
        </span>
        <h2 id="add-ons-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
          Add to Complete Your Pot
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-sm">
        {picks.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
