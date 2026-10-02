"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem, Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { removeItem, setQuantity } from "@/store/cartSlice";
import Icon from "@/components/store/Icon";

export default function CartLineItem({ item, product }: { item: CartItem; product?: Product }) {
  const dispatch = useAppDispatch();
  const href = `/groceries/${item.productSlug}`;
  const atMax = item.quantity >= item.maxPerOrder;

  return (
    <li className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md w-full sm:w-auto min-w-0">
          <Link
            href={href}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container-low shrink-0 overflow-hidden block"
          >
            <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
          </Link>
          <div className="flex flex-col min-w-0">
            {product && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider">
                  {product.categoryLabel}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-0.5">
                  <Icon name="location_on" className="text-xs text-primary" /> {product.origin}
                </span>
              </div>
            )}
            <h2 className="font-title-md text-title-md text-on-surface font-bold">
              <Link href={href} className="hover:text-primary transition-colors">
                {item.name}
              </Link>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{item.variantLabel}</p>
            {atMax && (
              <p className="mt-2 font-label-caps text-label-caps text-secondary" role="status">
                Maximum of {item.maxPerOrder} per order
              </p>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-space-sm pt-2 sm:pt-0">
          <div className="flex flex-col sm:items-end">
            <span className="font-price-xl text-price-xl text-primary font-bold">
              {formatNaira(item.unitPriceKobo * item.quantity)}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {item.quantity > 1 ? `${formatNaira(item.unitPriceKobo)} × ${item.quantity}` : `${formatNaira(item.unitPriceKobo)} each`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="inline-flex items-center bg-surface-container rounded-full p-1 shadow-inner">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                disabled={item.quantity <= 1}
                onClick={() => dispatch(setQuantity({ variantId: item.variantId, quantity: item.quantity - 1 }))}
                className="w-11 h-11 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="remove" className="text-base" />
              </button>
              <span aria-live="polite" className="w-8 text-center font-label-md text-label-md text-on-surface font-bold">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                disabled={atMax}
                onClick={() => dispatch(setQuantity({ variantId: item.variantId, quantity: item.quantity + 1 }))}
                className="w-11 h-11 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="add" className="text-base" />
              </button>
            </div>
            <button
              type="button"
              aria-label={`Remove ${item.name} from cart`}
              onClick={() => dispatch(removeItem(item.variantId))}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
            >
              <Icon name="delete" className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
