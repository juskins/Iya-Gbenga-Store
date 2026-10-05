"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { reconcile, selectCartCount, selectCartSubtotal } from "@/store/cartSlice";
import Icon from "@/components/store/Icon";
import CartLineItem from "./CartLineItem";
import CartSkeleton from "./CartSkeleton";
import EmptyCart from "./EmptyCart";
import FreeDeliveryBar from "./FreeDeliveryBar";
import OrderNote from "./OrderNote";
import OrderSummary from "./OrderSummary";
import RecommendedAddOns from "./RecommendedAddOns";

export default function CartView({ products }: { products: Product[] }) {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const signedIn = useAppSelector((s) => s.cart.userId !== null);
  const items = useAppSelector((s) => s.cart.items);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  // Sync saved lines with the live catalog: drop unavailable items, refresh prices and limits.
  useEffect(() => {
    // Signed-in carts come from the database with live prices already; this is for guest carts only.
    if (!hydrated || signedIn) return;
    const live: Record<string, { priceKobo: number; maxPerOrder: number }> = {};
    for (const p of products)
      for (const v of p.variants)
        if (v.stockQty > 0) live[v.id] = { priceKobo: v.priceKobo, maxPerOrder: Math.min(v.maxPerOrder, v.stockQty) };
    dispatch(reconcile(live));
  }, [hydrated, signedIn, products, dispatch]);

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-space-md">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-space-md">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <Icon name="chevron_right" className="text-sm text-outline" />
        <Link href="/groceries" className="hover:text-primary transition-colors">
          Groceries
        </Link>
        <Icon name="chevron_right" className="text-sm text-outline" />
        <span aria-current="page" className="font-label-md text-label-md text-primary font-bold">
          Shopping Cart{hydrated && count > 0 ? ` (${count} ${count === 1 ? "item" : "items"})` : ""}
        </span>
      </nav>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <FreeDeliveryBar subtotalKobo={subtotal} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-wrap items-center gap-space-sm">
                <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-lg md:text-headline-lg text-primary font-bold">
                  Your Basket
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps uppercase">
                  {items.length} unique {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <ul className="flex flex-col gap-space-md">
                {items.map((item) => (
                  <CartLineItem key={item.variantId} item={item} product={products.find((p) => p.slug === item.productSlug)} />
                ))}
              </ul>
              <OrderNote />
              <RecommendedAddOns products={products} />
            </div>
            <OrderSummary count={count} subtotalKobo={subtotal} />
          </div>
        </>
      )}
    </div>
  );
}
