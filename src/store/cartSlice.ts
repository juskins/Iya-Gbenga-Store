import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/lib/types";
import { ORDER_NOTE_MAX } from "@/lib/config";

export type CartState = {
  items: CartItem[];
  note: string;
  hydrated: boolean;
};

const initialState: CartState = { items: [], note: "", hydrated: false };

const clamp = (q: number, max: number) => Math.max(1, Math.min(q, max));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<{ items: CartItem[]; note: string }>) {
      state.items = action.payload.items;
      state.note = action.payload.note;
      state.hydrated = true;
    },
    addItem(state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) {
      const { quantity = 1, ...item } = action.payload;
      const existing = state.items.find((i) => i.variantId === item.variantId);
      if (existing) existing.quantity = clamp(existing.quantity + quantity, existing.maxPerOrder);
      else state.items.push({ ...item, quantity: clamp(quantity, item.maxPerOrder) });
    },
    setQuantity(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const item = state.items.find((i) => i.variantId === action.payload.variantId);
      if (!item) return;
      if (action.payload.quantity < 1) {
        state.items = state.items.filter((i) => i.variantId !== item.variantId);
      } else {
        item.quantity = clamp(action.payload.quantity, item.maxPerOrder);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
    },
    setNote(state, action: PayloadAction<string>) {
      state.note = action.payload.slice(0, ORDER_NOTE_MAX);
    },
    /** Align saved lines with the live catalog: drop missing variants, refresh price and per-order limit. */
    reconcile(state, action: PayloadAction<Record<string, { priceKobo: number; maxPerOrder: number }>>) {
      state.items = state.items
        .filter((i) => action.payload[i.variantId])
        .map((i) => {
          const live = action.payload[i.variantId];
          return {
            ...i,
            unitPriceKobo: live.priceKobo,
            maxPerOrder: live.maxPerOrder,
            quantity: Math.min(i.quantity, live.maxPerOrder),
          };
        });
    },
    clearCart(state) {
      state.items = [];
      state.note = "";
    },
  },
});

export const { hydrate, addItem, setQuantity, removeItem, setNote, reconcile, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Display-only totals. The server recalculates everything at checkout.
export const selectCartCount = (s: { cart: CartState }) =>
  s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (s: { cart: CartState }) =>
  s.cart.items.reduce((n, i) => n + i.unitPriceKobo * i.quantity, 0);
