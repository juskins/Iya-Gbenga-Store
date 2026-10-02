"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/store/ProductCard";

const TABS = [
  { id: "all", label: "All Items" },
  { id: "tubers-staples", label: "Tubers" },
  { id: "oils-seasonings", label: "Oils" },
  { id: "dried-seafood", label: "Dried Seafood" },
  { id: "soup-bundles", label: "Bundles" },
];

export default function BestOfMarket({ products }: { products: Product[] }) {
  const [active, setActive] = useState("all");
  const visible = active === "all" ? products : products.filter((p) => p.categorySlug === active);

  return (
    <section className="w-full py-16 px-margin-mobile md:px-margin-desktop bg-surface-container-low/50">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
              Kitchen Essentials
            </span>
            <h2 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary">Best of the Market</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Top-grade pantry staples checked for freshness before pack-out.
            </p>
          </div>
          <div
            role="group"
            aria-label="Filter products by category"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            {TABS.map((t) => {
              const on = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(t.id)}
                  className={`min-h-11 px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                    on
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-primary shadow-sm"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        {visible.length ? (
          <div className="grid grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant py-8 text-center">
            No products in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
