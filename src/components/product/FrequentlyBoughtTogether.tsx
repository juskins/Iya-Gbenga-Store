import ProductCard from "@/components/store/ProductCard";
import { getRelatedProducts } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";

export default async function FrequentlyBoughtTogether({ product }: { product: Product }) {
  const related = await getRelatedProducts(product, 3);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="fbt-heading" className="bg-surface-container-low rounded-xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
          Kitchen Essentials
        </span>
        <h2 id="fbt-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
          Frequently Bought Together
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Handpicked items that go well with this product.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
