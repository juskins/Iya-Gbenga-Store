"use client";

import type { Product, Variant } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, setQuantity } from "@/store/cartSlice";
import { showToast } from "@/store/uiSlice";
import Icon from "./Icon";

export function toCartItem(product: Product, variant: Variant) {
  return {
    variantId: variant.id,
    productSlug: product.slug,
    name: product.name,
    variantLabel: variant.label,
    image: product.images[0],
    unitPriceKobo: variant.priceKobo,
    maxPerOrder: Math.min(variant.maxPerOrder, variant.stockQty),
  };
}

/** "Add" button that turns into a quantity stepper once the variant is in the cart. */
export default function AddToCartControl({ product, variant }: { product: Product; variant: Variant }) {
  const dispatch = useAppDispatch();
  const line = useAppSelector((s) => s.cart.items.find((i) => i.variantId === variant.id));

  if (variant.stockQty <= 0) {
    return (
      <button
        disabled
        className="px-4 py-2 min-h-11 rounded-full bg-surface-container-high text-outline font-label-md text-label-md cursor-not-allowed"
      >
        Sold Out
      </button>
    );
  }

  if (line) {
    return (
      <div className="flex items-center rounded-full bg-primary text-on-primary shadow-sm">
        <button
          aria-label={`Decrease quantity of ${product.name}`}
          onClick={() => dispatch(setQuantity({ variantId: variant.id, quantity: line.quantity - 1 }))}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-primary-container transition-colors"
        >
          <Icon name="remove" className="text-lg" />
        </button>
        <span className="min-w-6 text-center font-label-md text-label-md" aria-live="polite">
          {line.quantity}
        </span>
        <button
          aria-label={`Increase quantity of ${product.name}`}
          disabled={line.quantity >= line.maxPerOrder}
          onClick={() => dispatch(setQuantity({ variantId: variant.id, quantity: line.quantity + 1 }))}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-primary-container transition-colors disabled:opacity-40"
        >
          <Icon name="add" className="text-lg" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        dispatch(addItem(toCartItem(product, variant)));
        dispatch(showToast("Added to cart"));
      }}
      className="flex items-center gap-1.5 px-4 py-2 min-h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm"
    >
      <Icon name="add_shopping_cart" className="text-base" />
      <span>Add</span>
    </button>
  );
}
