"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { hydrate } from "./cartSlice";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "iya-gbenga-cart-v2";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as { items: CartItem[]; note: string }) : null;
      store.dispatch(hydrate({ items: saved?.items ?? [], note: saved?.note ?? "" }));
    } catch {
      store.dispatch(hydrate({ items: [], note: "" }));
    }
    return store.subscribe(() => {
      const { cart } = store.getState();
      if (!cart.hydrated) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: cart.items, note: cart.note }));
      } catch {
        /* storage unavailable: cart stays in memory */
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
