import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-space-xl text-center">
      <h1 className="font-headline-lg text-headline-lg text-primary font-bold mb-3">Product not found</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6">
        We couldn&apos;t find that product. It may have been removed or the link may be wrong.
      </p>
      <Link
        href="/groceries"
        className="inline-flex items-center min-h-12 px-6 bg-primary text-on-primary font-title-md text-title-md rounded-full hover:bg-primary-container transition-colors"
      >
        Browse all groceries
      </Link>
    </section>
  );
}
