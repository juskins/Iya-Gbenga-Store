import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import Badge from "./Badge";
import Stars from "./Stars";
import AddToCartControl from "./AddToCartControl";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  // Cards add the cheapest in-stock variant; pick other sizes on the product page.
  const inStock = product.variants.filter((v) => v.stockQty > 0);
  const variant = [...(inStock.length ? inStock : product.variants)].sort((a, b) => a.priceKobo - b.priceKobo)[0];
  const soldOut = inStock.length === 0;
  const href = `/groceries/${product.slug}`;

  return (
    <div className="group flex flex-col bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all">
      <Link href={href} className="relative block w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4">
        {soldOut ? (
          <Badge text="Sold Out" tone="error" className="absolute top-2.5 left-2.5 z-10" />
        ) : (
          product.badge && <Badge {...product.badge} className="absolute top-2.5 left-2.5 z-10" />
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <span className="font-body-sm text-body-sm text-outline mb-1">{product.categoryLabel}</span>
      <h3 className="font-title-md text-title-md text-on-surface font-semibold line-clamp-2 mb-2">
        <Link href={href} className="hover:text-primary transition-colors">
          {product.name}
        </Link>
      </h3>
      {product.rating !== undefined && product.reviewCount ? (
        <div className="flex items-center gap-1 mb-3">
          <Stars rating={product.rating} />
          <span className="font-body-sm text-body-sm text-on-surface-variant">({product.reviewCount})</span>
        </div>
      ) : (
        <div className="mb-3" />
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="font-price-card text-price-card text-primary font-bold">
            {product.variants.length > 1 && "From "}
            {formatNaira(variant.priceKobo)}
          </span>
          {variant.compareAtPriceKobo && (
            <span className="font-body-sm text-body-sm text-outline line-through">
              {formatNaira(variant.compareAtPriceKobo)}
            </span>
          )}
        </div>
        <AddToCartControl product={product} variant={variant} />
      </div>
    </div>
  );
}
