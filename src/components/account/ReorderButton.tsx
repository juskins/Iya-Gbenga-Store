"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { showToast } from "@/store/uiSlice";
import Icon from "@/components/store/Icon";

export type ReorderLine = {
  name: string;
  variantLabel: string;
  /** Present only when the variant still exists and is in stock; built from the CURRENT catalog. */
  cartItem: Omit<CartItem, "quantity"> | null;
  quantity: number;
};

export default function ReorderButton({ lines, label = "Reorder" }: { lines: ReorderLine[]; label?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const available = lines.filter((l) => l.cartItem);

  const reorder = () => {
    const missing: string[] = [];
    let added = 0;
    for (const line of lines) {
      if (!line.cartItem || line.cartItem.maxPerOrder < 1) {
        missing.push(`${line.name} (${line.variantLabel})`);
        continue;
      }
      dispatch(addItem({ ...line.cartItem, quantity: Math.min(line.quantity, line.cartItem.maxPerOrder) }));
      added += 1;
    }
    setUnavailable(missing);
    if (added === 0) return;
    dispatch(showToast(missing.length ? `Added ${added} of ${lines.length} items to cart` : "Items added to cart"));
    if (missing.length === 0) router.push("/cart");
    else setTimeout(() => router.push("/cart"), 2500);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={reorder}
        disabled={available.length === 0}
        className="inline-flex items-center justify-center gap-2 min-h-11 px-8 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name="replay" className="text-lg" />
        {label}
      </button>
      {available.length === 0 && (
        <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">None of these items are currently available.</p>
      )}
      {unavailable.length > 0 && (
        <p role="status" className="font-body-sm text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">
          Not available right now and skipped: {unavailable.join(", ")}.
        </p>
      )}
    </div>
  );
}
