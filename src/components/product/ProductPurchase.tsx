"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/store/Icon";
import Stars from "@/components/store/Stars";
import { toCartItem } from "@/components/store/AddToCartControl";
import { formatNaira } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/config";
import type { Product } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { showToast } from "@/store/uiSlice";

export default function ProductPurchase({ product, productUrl }: { product: Product; productUrl: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const firstInStock = product.variants.find((v) => v.stockQty > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstInStock;
  const soldOut = variant.stockQty <= 0;
  const max = Math.max(1, Math.min(variant.maxPerOrder, variant.stockQty));
  const quantity = Math.min(qty, max);
  const totalKobo = variant.priceKobo * quantity;
  const compareAt = variant.compareAtPriceKobo;
  const saveKobo = compareAt && compareAt > variant.priceKobo ? compareAt - variant.priceKobo : 0;
  const savePct = compareAt ? Math.round((saveKobo / compareAt) * 100) : 0;
  const lowStock = !soldOut && variant.stockQty <= 10;

  const selectVariant = (id: string) => {
    setVariantId(id);
    setQty(1);
  };

  const add = () => {
    dispatch(addItem({ ...toCartItem(product, variant), quantity }));
    dispatch(showToast("Added to cart"));
  };
  const buyNow = () => {
    dispatch(addItem({ ...toCartItem(product, variant), quantity }));
    router.push("/checkout");
  };

  const waText = `Hello Iya Gbenga, I want to order:\n${product.name}\nSize: ${variant.label}\nQuantity: ${quantity}\n${productUrl}`;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <div className="flex flex-col gap-space-md bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider flex items-center gap-1.5">
              <Icon name="location_on" className="text-sm" />
              {product.origin}
            </span>
            <span className="font-label-caps text-label-caps text-outline bg-surface-container-low px-2 py-0.5 rounded">
              SKU: {variant.sku}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold leading-tight">{product.name}</h1>
          {product.rating !== undefined && product.reviewCount ? (
            <div className="flex items-center gap-3 pt-1">
              <Stars rating={product.rating} className="text-base" />
              <span className="font-title-md text-title-md text-on-surface font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-outline text-body-sm" aria-hidden="true">
                •
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">{product.reviewCount} ratings</span>
            </div>
          ) : null}
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-headline-xl text-headline-xl text-primary font-black">
              {formatNaira(variant.priceKobo)}
            </span>
            {saveKobo > 0 && compareAt && (
              <>
                <span className="font-title-md text-title-md text-outline line-through">{formatNaira(compareAt)}</span>
                <span className="px-2.5 py-1 bg-secondary text-on-secondary font-label-caps text-label-caps rounded-full font-bold">
                  Save {formatNaira(saveKobo)} ({savePct}% off)
                </span>
              </>
            )}
          </div>
          <div className={`flex items-center gap-2 pt-1 ${soldOut ? "text-error" : "text-primary"}`} role="status">
            <span className={`inline-flex rounded-full h-3 w-3 ${soldOut ? "bg-error" : "bg-tertiary-container"}`} />
            <span className="font-label-md text-label-md font-semibold">
              {soldOut ? "Out of stock" : lowStock ? `Low stock, only ${variant.stockQty} left` : "In stock"}
            </span>
          </div>
        </div>

        {product.variants.length > 1 && (
          <fieldset className="flex flex-col">
            <legend className="font-title-md text-title-md text-on-surface font-bold mb-2.5">Select Size:</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {product.variants.map((v) => {
                const selected = v.id === variant.id;
                const out = v.stockQty <= 0;
                return (
                  <label
                    key={v.id}
                    className={`p-3 rounded-lg text-left transition-all shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
                      selected
                        ? "bg-primary text-on-primary ring-2 ring-primary"
                        : "bg-surface-container-lowest hover:bg-surface-container-low"
                    } ${out ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={v.id}
                      checked={selected}
                      disabled={out}
                      onChange={() => selectVariant(v.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between font-label-md text-label-md font-bold">
                      <span>{v.label}</span>
                      {selected && <Icon name="check_circle" className="text-sm" />}
                    </span>
                    <span
                      className={`block font-price-card text-body-sm ${selected ? "text-primary-fixed" : "text-outline"}`}
                    >
                      {out ? "Sold out" : formatNaira(v.priceKobo)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-title-md text-title-md text-on-surface font-semibold" id="qty-label">
              Quantity:
            </span>
            <div
              role="group"
              aria-labelledby="qty-label"
              className="inline-flex items-center bg-surface-container-low rounded-full p-1 shadow-inner"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={soldOut || quantity <= 1}
                onClick={() => setQty(quantity - 1)}
                className="w-11 h-11 rounded-full bg-surface-container-lowest text-primary hover:bg-surface-variant flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
              >
                <Icon name="remove" className="text-lg" />
              </button>
              <output aria-live="polite" className="w-12 text-center font-title-md text-title-md font-bold text-on-surface">
                {quantity}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={soldOut || quantity >= max}
                onClick={() => setQty(quantity + 1)}
                className="w-11 h-11 rounded-full bg-surface-container-lowest text-primary hover:bg-surface-variant flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
              >
                <Icon name="add" className="text-lg" />
              </button>
            </div>
            {!soldOut && <span className="font-body-sm text-body-sm text-on-surface-variant">Max {max} per order</span>}
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="button"
              disabled={soldOut}
              onClick={add}
              className="w-full min-h-12 py-4 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-full flex items-center justify-center gap-3 shadow-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="shopping_basket" className="text-2xl" />
              {soldOut ? "Out of stock" : `Add to Cart — ${formatNaira(totalKobo)}`}
            </button>
            <button
              type="button"
              disabled={soldOut}
              onClick={buyNow}
              className="w-full min-h-12 py-3.5 px-6 bg-secondary text-on-secondary font-title-md text-title-md font-bold rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-on-secondary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="flash_on" className="text-xl" />
              Buy Now
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-12 py-3 px-6 bg-[#25D366] text-white font-title-md text-title-md font-bold rounded-full flex items-center justify-center gap-2 shadow-sm hover:brightness-105 transition-all"
            >
              <Icon name="chat" className="text-xl" />
              Order via WhatsApp
            </a>
          </div>
        </div>

        <div className="bg-surface-container-low/60 rounded-xl p-4 flex flex-col gap-3 mt-1">
          <div className="flex items-start gap-3">
            <Icon name="local_shipping" className="text-primary text-xl mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">Delivery across Lagos</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Delivery fees and timing are shown at checkout.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="inventory_2" className="text-primary text-xl mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">Carefully packed</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Each order is packed to arrive fresh and intact.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest shadow-[0_-2px_12px_rgba(0,0,0,0.08)] px-margin-mobile py-3 flex items-center gap-3">
        <div className="flex flex-col min-w-0">
          <span className="font-label-caps text-label-caps text-outline truncate">{variant.label}</span>
          <span className="font-price-card text-price-card text-primary font-bold">{formatNaira(totalKobo)}</span>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={add}
          className="flex-1 min-h-12 px-4 bg-primary text-on-primary font-title-md text-title-md rounded-full flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50"
        >
          <Icon name="shopping_basket" className="text-xl" />
          {soldOut ? "Out of stock" : "Add to Cart"}
        </button>
      </div>
    </>
  );
}
