import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/store/Icon";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductTabs from "@/components/product/ProductTabs";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import { getProductBySlug } from "@/lib/data/catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: PageProps<"/groceries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/groceries/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/groceries/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const url = `${SITE_URL}/groceries/${product.slug}`;
  const prices = product.variants.map((v) => v.priceKobo / 100);
  const anyStock = product.variants.some((v) => v.stockQty > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.variants[0].sku,
    url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NGN",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: anyStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const sep = (
    <li aria-hidden="true">
      <Icon name="chevron_right" className="text-xs text-outline" />
    </li>
  );

  return (
    <div className="flex flex-col w-full pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            {sep}
            <li>
              <Link href="/groceries" className="hover:text-primary transition-colors">
                Groceries
              </Link>
            </li>
            {sep}
            <li>
              <Link href={`/groceries?category=${product.categorySlug}`} className="hover:text-primary transition-colors">
                {product.categoryLabel}
              </Link>
            </li>
            {sep}
            <li aria-current="page" className="text-primary font-semibold">
              {product.name}
            </li>
          </ol>
        </nav>
      </section>

      <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop pb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          <div className="lg:col-span-6 xl:col-span-7">
            <ProductGallery product={product} />
          </div>
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductPurchase product={product} productUrl={url} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop pb-space-xl">
        <ProductTabs product={product} />
      </section>

      <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop pb-space-xl">
        <FrequentlyBoughtTogether product={product} />
      </section>
    </div>
  );
}
