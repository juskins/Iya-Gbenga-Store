import Link from "next/link";
import { categories } from "@/lib/data/categories";
import Icon from "@/components/store/Icon";

const linkClass = "font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-xl pt-space-xl pb-space-lg text-on-surface">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg mb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">Iya Gbenga&apos;s Store</span>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Iya Gbenga&apos;s Store brings the authentic taste of home to your kitchen. Premium, handpicked Nigerian
              groceries sourced directly from local farmers and trusted markets.
            </p>
            <div className="flex items-center gap-space-md pt-2">
              <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
                <Icon name="verified" className="text-xl" />
                <span>Guaranteed Freshness</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
                <Icon name="lock" className="text-xl" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>

          <nav aria-label="Categories" className="flex flex-col gap-3">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-1">Categories</h4>
            {categories.slice(0, 5).map((c) => (
              <Link key={c.slug} href={`/groceries?category=${c.slug}`} className={linkClass}>
                {c.name}
              </Link>
            ))}
          </nav>

          <nav aria-label="Customer service" className="flex flex-col gap-3">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-1">Customer Service</h4>
            <Link href="/groceries" className={linkClass}>
              Shop All Groceries
            </Link>
            <Link href="/cart" className={linkClass}>
              Your Cart
            </Link>
          </nav>

          <nav aria-label="My account" className="flex flex-col gap-3">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-1">My Account</h4>
            <Link href="/account/orders" className={linkClass}>
              Order History
            </Link>
            <Link href="/login" className={linkClass}>
              Google Sign-In
            </Link>
          </nav>
        </div>

        <div className="rounded-xl p-6 bg-surface-container-high/30 flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-col md:flex-row items-center gap-space-md">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              Pay on delivery or bank transfer
            </span>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} Iya Gbenga&apos;s Store. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
