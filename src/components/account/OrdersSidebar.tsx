import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/store/Icon";
import AddToCartControl from "@/components/store/AddToCartControl";
import { formatNaira } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/config";
import type { Product, Variant } from "@/lib/types";

export type Staple = { product: Product; variant: Variant };

export default function OrdersSidebar({ staples }: { staples: Staple[] }) {
  return (
    <aside className="flex flex-col gap-space-lg">
      <section className="bg-primary-container text-on-primary rounded-xl p-space-md shadow-md flex flex-col gap-3">
        <h2 className="font-title-md text-title-md font-bold">Need help with an order?</h2>
        <p className="font-body-sm text-body-sm text-on-primary-container">
          Message our team on WhatsApp with your order number and we will get back to you as soon as we can.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold hover:opacity-90 transition-opacity"
        >
          <Icon name="chat" className="text-lg" /> Chat on WhatsApp
        </a>
      </section>

      {staples.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm" aria-labelledby="staples-heading">
          <div className="flex items-start justify-between mb-space-sm">
            <div>
              <h2 id="staples-heading" className="font-title-md text-title-md font-bold text-primary">Fast Reorder Staples</h2>
              <p className="font-body-sm text-body-sm text-outline">From your past orders</p>
            </div>
            <Icon name="repeat" className="text-secondary text-xl" />
          </div>
          <ul className="flex flex-col gap-2">
            {staples.map(({ product, variant }) => (
              <li key={variant.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/groceries/${product.slug}`} className="font-title-md text-body-sm font-bold text-on-surface line-clamp-2 hover:text-primary">
                    {product.name}
                  </Link>
                  <p className="font-body-sm text-[12px] text-outline">{variant.label} · {formatNaira(variant.priceKobo)}</p>
                </div>
                <AddToCartControl product={product} variant={variant} />
              </li>
            ))}
          </ul>
          <Link href="/groceries" className="mt-space-sm inline-flex items-center justify-center w-full min-h-11 text-secondary font-label-md text-label-md font-bold">
            Browse all groceries
          </Link>
        </section>
      )}
    </aside>
  );
}
