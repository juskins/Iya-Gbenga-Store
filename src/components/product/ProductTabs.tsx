"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Icon from "@/components/store/Icon";
import type { Product } from "@/lib/types";

const TABS = [
  { id: "description", label: "Description" },
  { id: "sourcing", label: "Sourcing and Freshness" },
  { id: "storage", label: "Storage and Shelf Life" },
] as const;

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  const sourcing = [
    {
      icon: "agriculture",
      title: "Where it comes from",
      body: `This product is sourced from ${product.origin}. We work with trusted suppliers and keep track of where each item comes from.`,
    },
    {
      icon: "fact_check",
      title: "Checked before packing",
      body: "Items are looked over by our team before they are packed, so what you receive matches what you ordered.",
    },
    {
      icon: "eco",
      title: "Kept fresh",
      body: "We aim to move stock quickly and pack orders close to dispatch so your groceries reach you in good condition.",
    },
  ];

  const tips = [
    "Store in a cool, dry place away from direct sunlight and heat.",
    "Keep containers and packs tightly closed after opening.",
    "Use clean, dry utensils when handling the product.",
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 md:p-10">
      <div role="tablist" aria-label="Product information" className="flex items-center gap-2 overflow-x-auto pb-4">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`px-6 py-3 min-h-11 rounded-full font-title-md text-title-md font-bold whitespace-nowrap transition-all ${
              active === i
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" hidden={active !== 0} className="pt-6">
        <div className="max-w-3xl flex flex-col gap-4">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">About this product</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{product.description}</p>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Origin: {product.origin}. Available in {product.variants.map((v) => v.label).join(", ")}.
          </p>
        </div>
      </div>

      <div role="tabpanel" id="panel-sourcing" aria-labelledby="tab-sourcing" hidden={active !== 1} className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sourcing.map((c) => (
            <div key={c.title} className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-3">
              <Icon name={c.icon} className="text-3xl text-primary" />
              <h3 className="font-title-md text-title-md text-primary font-bold">{c.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div role="tabpanel" id="panel-storage" aria-labelledby="tab-storage" hidden={active !== 2} className="pt-6">
        <div className="max-w-3xl flex flex-col gap-4">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Storage tips</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Shelf life varies by product and batch. Check the label on your delivery for the best-before guidance.
          </p>
          <ul className="space-y-3 pt-2">
            {tips.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Icon name="check" className="text-primary text-xl" />
                <span className="font-body-md text-body-md text-on-surface">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
