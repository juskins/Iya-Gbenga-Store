"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/store/Icon";
import { useAppDispatch } from "@/store/hooks";
import { setFilterSheet } from "@/store/uiSlice";
import { buildHref, LIMITS, SORTS, type CatalogState, type SortValue } from "./query";

/** Search (300ms debounce), sort, per-page and the mobile filters trigger. */
export default function CatalogToolbar({ state, filterCount }: { state: CatalogState; filterCount: number }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the field in sync with the URL (reset, back button) unless the user is typing.
  useEffect(() => {
    const el = inputRef.current;
    if (el && document.activeElement !== el) el.value = state.q;
  }, [state.q]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onSearch = (value: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = value.trim();
      if (q !== state.q) router.push(buildHref(state, { q }), { scroll: false });
    }, 300);
  };

  const selectCls =
    "appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md min-h-11 pl-3.5 pr-9 rounded-full cursor-pointer hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <form role="search" onSubmit={(e) => { e.preventDefault(); clearTimeout(timer.current); const q = (inputRef.current?.value ?? "").trim(); router.push(buildHref(state, { q }), { scroll: false }); }} className="relative w-full lg:max-w-sm">
        <label htmlFor="catalog-search" className="sr-only">Search this catalog</label>
        <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl" />
        <input
          id="catalog-search"
          ref={inputRef}
          type="search"
          defaultValue={state.q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search yams, crayfish, palm oil..."
          className="w-full min-h-11 bg-surface-container-low rounded-full pl-11 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </form>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <button
          type="button"
          onClick={() => dispatch(setFilterSheet(true))}
          className="lg:hidden flex items-center justify-center gap-2 bg-surface-container-low text-primary px-4 min-h-11 rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors"
        >
          <Icon name="tune" className="text-lg" />
          Filters{filterCount > 0 && ` (${filterCount})`}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="catalog-sort" className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Sort by:</label>
          <div className="relative">
            <select
              id="catalog-sort"
              value={state.sort}
              onChange={(e) => router.push(buildHref(state, { sort: e.target.value as SortValue }), { scroll: false })}
              className={selectCls}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Icon name="expand_more" className="text-outline text-base absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:ml-2">
          <label htmlFor="catalog-limit" className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Per page:</label>
          <div className="relative">
            <select
              id="catalog-limit"
              value={state.limit}
              onChange={(e) => router.push(buildHref(state, { limit: Number(e.target.value) }), { scroll: false })}
              className={selectCls}
            >
              {LIMITS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <Icon name="expand_more" className="text-outline text-base absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
