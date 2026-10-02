import type { Product, Variant } from "@/lib/types";
import type { ReorderLine } from "./ReorderButton";

export type CatalogIndex = Map<string, { product: Product; variant: Variant }>;

export type OrderItemRow = {
  variant_id: string | null;
  product_name: string;
  variant_label: string;
  quantity: number;
};

export function indexVariants(products: Product[]): CatalogIndex {
  const map: CatalogIndex = new Map();
  for (const product of products) for (const variant of product.variants) map.set(variant.id, { product, variant });
  return map;
}

/** Match order items to CURRENT catalog variants (current price/stock); unavailable ones get cartItem null. */
export function buildReorderLines(items: OrderItemRow[], index: CatalogIndex): ReorderLine[] {
  return items.map((item) => {
    const match = item.variant_id ? index.get(item.variant_id) : undefined;
    return {
      name: item.product_name,
      variantLabel: item.variant_label,
      quantity: item.quantity,
      cartItem:
        match && match.variant.stockQty > 0
          ? {
              variantId: match.variant.id,
              productSlug: match.product.slug,
              name: match.product.name,
              variantLabel: match.variant.label,
              image: match.product.images[0],
              unitPriceKobo: match.variant.priceKobo,
              maxPerOrder: Math.min(match.variant.maxPerOrder, match.variant.stockQty),
            }
          : null,
    };
  });
}
