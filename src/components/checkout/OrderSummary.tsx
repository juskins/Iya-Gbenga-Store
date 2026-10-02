"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/store/Icon";
import { formatNaira } from "@/lib/format";
import type { CartItem } from "@/lib/types";

type Props = {
  items: CartItem[];
  count: number;
  subtotalKobo: number;
  shippingKobo: number;
  shippingLabel: string;
  totalKobo: number;
  submitting: boolean;
  canSubmit: boolean;
};

export default function OrderSummary({
  items,
  count,
  subtotalKobo,
  shippingKobo,
  shippingLabel,
  totalKobo,
  submitting,
  canSubmit,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <aside aria-label="Order summary" className="bg-surface-container-lowest p-6 rounded-2xl shadow-md flex flex-col gap-5 lg:sticky lg:top-28">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Review Order</h2>
        <span className="bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps px-2.5 py-1 rounded-full uppercase font-bold">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="summary-items"
        className="lg:hidden min-h-11 flex items-center justify-between rounded-xl bg-surface-container-low px-4 font-label-md text-label-md text-primary font-bold"
      >
        {open ? "Hide items" : "Show items"}
        <Icon name={open ? "expand_less" : "expand_more"} />
      </button>

      <ul id="summary-items" className={`${open ? "flex" : "hidden"} lg:flex flex-col gap-4`}>
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-xl bg-surface-container-low flex-shrink-0 overflow-hidden">
              <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              <span className="absolute top-0 right-0 bg-primary text-on-primary font-label-caps text-[10px] min-w-5 h-5 px-1 rounded-bl-lg flex items-center justify-center font-bold">
                <span className="sr-only">Quantity </span>
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-title-md text-body-md font-semibold text-on-surface truncate">{item.name}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.variantLabel}</p>
            </div>
            <span className="font-price-card text-body-md font-bold text-on-surface">
              {formatNaira(item.unitPriceKobo * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2.5 pt-2">
        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <dt>Items Subtotal</dt>
          <dd className="text-on-surface font-semibold">{formatNaira(subtotalKobo)}</dd>
        </div>
        <div className="flex justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
          <dt>{shippingLabel}</dt>
          <dd className="text-on-surface font-semibold">{shippingKobo === 0 ? "Free" : formatNaira(shippingKobo)}</dd>
        </div>
        <div className="my-1 h-px bg-surface-container-high" />
        <div className="flex items-baseline justify-between pt-1">
          <dt className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Total</dt>
          <dd className="font-price-xl text-price-xl text-primary font-extrabold">{formatNaira(totalKobo)}</dd>
        </div>
      </dl>

      <button
        type="submit"
        form="checkout-form"
        disabled={submitting || !canSubmit}
        aria-busy={submitting}
        className="w-full min-h-12 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-lg font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-on-primary/40 border-t-on-primary animate-spin" />
            <span>Placing order…</span>
          </>
        ) : (
          <>
            <Icon name="check_circle" className="!text-2xl" />
            <span>Place Order · {formatNaira(totalKobo)}</span>
          </>
        )}
      </button>
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        The store confirms final prices and stock when your order is received.
      </p>
    </aside>
  );
}
