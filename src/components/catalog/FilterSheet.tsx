"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/store/Icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFilterSheet } from "@/store/uiSlice";
import FilterPanel, { type CategoryOption } from "./FilterPanel";
import type { CatalogState } from "./query";

/** Mobile bottom sheet hosting the filters. Open state lives in the ui slice. */
export default function FilterSheet({
  state,
  categories,
  resultCount,
}: {
  state: CatalogState;
  categories: CategoryOption[];
  resultCount: number;
}) {
  const open = useAppSelector((s) => s.ui.filterSheetOpen);
  const dispatch = useAppDispatch();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => dispatch(setFilterSheet(false));

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setFilterSheet(false));
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
      if (!f.length) return;
      const firstEl = f[0];
      const lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-on-surface/40" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-surface-container-lowest rounded-t-3xl shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="font-title-md text-title-md text-on-surface font-semibold">Filters</span>
          <button type="button" onClick={close} aria-label="Close filters" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-low">
            <Icon name="close" className="text-xl" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4">
          <FilterPanel state={state} categories={categories} idPrefix="sheet" />
        </div>
        <div className="p-4 border-t border-outline-variant/40">
          <button type="button" onClick={close} className="w-full min-h-11 bg-primary text-on-primary rounded-full font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors">
            Show {resultCount} {resultCount === 1 ? "item" : "items"}
          </button>
        </div>
      </div>
    </div>
  );
}
