"use client";

import { useEffect } from "react";
import { useStore } from "react-redux";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types";
import type { AppDispatch, RootState } from "./index";
import { cartSyncControls } from "./cartWriteThrough";
import { clearGuestCart, readGuestCart, writeGuestCart } from "./cartStorage";
import { hydrate, replaceCart, setUser } from "./cartSlice";

type ServerLine = CartItem & { stockQty: number; available: boolean };
type ServerCart = { note: string | null; items: ServerLine[] };

/**
 * Keeps the Redux cart in step with the database.
 *  - Guest: local only (localStorage).
 *  - Signed in: the database is the source of truth. On sign-in the guest cart is merged in,
 *    then the cart is read with get_cart() and kept fresh by a realtime subscription to this
 *    user's `carts` row, so changes from another device (e.g. the mobile app) appear instantly.
 * Realtime events are only a signal; the real state is always re-read from the database.
 */
export default function CartSync() {
  const store = useStore<RootState>();

  useEffect(() => {
    const supabase = createClient();
    const dispatch = store.dispatch as AppDispatch;
    let uid: string | null = null;
    let channel: RealtimeChannel | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    // Guests persist locally; signed-in carts are never stored in the browser.
    const unsubscribeStore = store.subscribe(() => {
      const { cart } = store.getState();
      if (cart.userId === null && cart.hydrated) writeGuestCart({ items: cart.items, note: cart.note });
    });

    async function fetchServerCart() {
      if (!uid || disposed) return;
      if (cartSyncControls.pending > 0) return; // refetch runs again when the writes finish
      const { data, error } = await supabase.rpc("get_cart");
      if (!uid || disposed || cartSyncControls.pending > 0) return;

      if (error || !data) {
        console.error("[cart] get_cart failed:", error?.message);
        if (!store.getState().cart.hydrated) dispatch(hydrate({ items: [], note: "" }));
        clearTimeout(retry);
        retry = setTimeout(fetchServerCart, 5000);
        return;
      }

      const server = data as ServerCart;
      const items: CartItem[] = server.items
        .filter((l) => l.available)
        .map((l) => ({
          variantId: l.variantId,
          productSlug: l.productSlug,
          name: l.name,
          variantLabel: l.variantLabel,
          image: l.image,
          unitPriceKobo: l.unitPriceKobo,
          quantity: l.quantity,
          maxPerOrder: l.maxPerOrder,
        }));
      // Lines that sold out are removed from the database copy too.
      for (const gone of server.items.filter((l) => !l.available)) {
        void supabase.rpc("remove_from_cart", { p_variant_id: gone.variantId });
      }

      const current = store.getState().cart;
      const note = server.note ?? "";
      if (!current.hydrated || JSON.stringify(current.items) !== JSON.stringify(items) || current.note !== note) {
        dispatch(replaceCart({ items, note }));
      }
    }

    const scheduleRefetch = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(fetchServerCart, ms);
    };
    cartSyncControls.refetch = () => scheduleRefetch(0);

    function subscribe(userId: string) {
      channel = supabase
        .channel(`cart-${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "carts", filter: `user_id=eq.${userId}` }, () =>
          scheduleRefetch(150),
        )
        .subscribe((status) => {
          // (Re)connected: catch up on anything missed while offline.
          if (status === "SUBSCRIBED") scheduleRefetch(0);
        });
    }

    async function enterUserMode(userId: string) {
      if (uid === userId) return;
      uid = userId;
      dispatch(setUser(userId));

      const guest = readGuestCart();
      if (guest.items.length > 0 || guest.note) {
        const { error } = await supabase.rpc("merge_cart", {
          p_items: guest.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
          p_note: guest.note || null,
        });
        if (!error) clearGuestCart();
        else console.error("[cart] merge_cart failed:", error.message);
      }

      await fetchServerCart();
      if (!disposed && uid === userId) subscribe(userId);
    }

    function enterGuestMode() {
      uid = null;
      clearTimeout(retry);
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      dispatch(setUser(null));
      dispatch(hydrate(readGuestCart()));
    }

    supabase.auth.getSession().then(({ data }) => {
      if (disposed) return;
      if (data.session) void enterUserMode(data.session.user.id);
      else enterGuestMode();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void enterUserMode(session.user.id);
      else if (event === "SIGNED_OUT") enterGuestMode();
    });

    // Tab/phone woke up or came back online: realtime may have been asleep.
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefetch(0);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(retry);
      cartSyncControls.refetch = null;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
      unsubscribeStore();
      sub.subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [store]);

  return null;
}
