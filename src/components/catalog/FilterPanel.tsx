"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/store/Icon";
import { formatNaira } from "@/lib/format";
import { buildHref, PRICE_CEILING, PRICE_STEP, type CatalogState, type StockValue } from "./query";

export type CategoryOption = { slug: string; name: string; count: number };

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/** Category / price / stock filters. Every change writes to the URL. */
export default function FilterPanel({
  state,
  categories,
  idPrefix,
}: {
  state: CatalogState;
  categories: CategoryOption[];
  idPrefix: string;
}) {
  const router = useRouter();
  const sliderId = useId();
  const go = (patch: Partial<CatalogState>) => router.push(buildHref(state, patch), { scroll: false });

  // While dragging, show the draft value; commit to the URL on release.
  const [draft, setDraft] = useState<number | null>(null);
  const max = draft ?? state.maxPrice ?? PRICE_CEILING;
  const commit = () => {
    if (draft === null) return;
    setDraft(null);
    go({ maxPrice: draft >= PRICE_CEILING ? undefined : draft, minPrice: state.minPrice });
  };

  const hasAny = state.categories.length > 0 || state.maxPrice !== undefined || state.minPrice !== undefined || state.stock.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="tune" className="text-primary text-xl" />
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Filter By</h2>
        </div>
        {hasAny && (
          <button
            type="button"
            onClick={() => router.push(buildHref({ ...state, categories: [], minPrice: undefined, maxPrice: undefined, stock: [] }), { scroll: false })}
            className="min-h-11 px-2 font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      <fieldset className="flex flex-col gap-2.5 min-w-0">
        <legend className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-bold mb-2.5">Category</legend>
        <ul className="flex flex-col gap-1 font-label-md text-label-md">
          {categories.map((c) => {
            const checked = state.categories.includes(c.slug);
            const id = `${idPrefix}-cat-${c.slug}`;
            return (
              <li key={c.slug}>
                <label htmlFor={id} className="flex items-center justify-between gap-2 min-h-11 cursor-pointer group px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="flex items-center gap-2.5">
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => go({ categories: toggle(state.categories, c.slug) })}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span className={checked ? "text-primary font-semibold" : "text-on-surface-variant group-hover:text-primary"}>{c.name}</span>
                  </span>
                  <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${checked ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-on-surface-variant"}`}>
                    {c.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor={sliderId} className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-bold">
            Price Budget
          </label>
          <span className="font-label-caps text-label-caps text-primary font-bold">Up to {max >= PRICE_CEILING ? `${formatNaira(PRICE_CEILING * 100)}+` : formatNaira(max * 100)}</span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={PRICE_STEP}
          max={PRICE_CEILING}
          step={PRICE_STEP}
          value={max}
          onChange={(e) => setDraft(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
          aria-valuetext={max >= PRICE_CEILING ? "Any price" : `Up to ${formatNaira(max * 100)}`}
          className="w-full min-h-11 accent-primary cursor-pointer"
        />
        <div className="flex items-center justify-between font-label-md text-label-md text-on-surface-variant text-xs">
          <span className="bg-surface-container-low px-2 py-1 rounded">{formatNaira(PRICE_STEP * 100)}</span>
          <span className="bg-surface-container-low px-2 py-1 rounded">{formatNaira(PRICE_CEILING * 100)}+</span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-1 min-w-0">
        <legend className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-bold mb-2.5">Stock Availability</legend>
        {([
          ["in", "In stock"],
          ["out", "Out of stock"],
        ] as [StockValue, string][]).map(([v, label]) => {
          const id = `${idPrefix}-stock-${v}`;
          return (
            <label key={v} htmlFor={id} className="flex items-center gap-2.5 min-h-11 px-1.5 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface-variant">
              <input
                id={id}
                type="checkbox"
                checked={state.stock.includes(v)}
                onChange={() => go({ stock: toggle(state.stock, v) })}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              {label}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
