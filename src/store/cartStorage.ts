import type { CartItem } from "@/lib/types";

/** Guest cart only. Signed-in users' carts live in the database. */
const STORAGE_KEY = "iya-gbenga-cart-v2";

export type GuestCart = { items: CartItem[]; note: string };

export function readGuestCart(): GuestCart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<GuestCart>) : null;
    return { items: Array.isArray(saved?.items) ? saved.items : [], note: typeof saved?.note === "string" ? saved.note : "" };
  } catch {
    return { items: [], note: "" };
  }
}

export function writeGuestCart(cart: GuestCart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* storage unavailable: cart stays in memory */
  }
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
