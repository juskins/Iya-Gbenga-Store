import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { createClient } from "@/lib/supabase/client";
import { addItem, clearCart, removeItem, setNote, setQuantity, type CartState } from "./cartSlice";
import { showToast } from "./uiSlice";

type State = { cart: CartState };
type Dispatch = (action: ReturnType<typeof showToast>) => unknown;

/**
 * Write-through for signed-in users. Redux updates instantly (optimistic); the same change is
 * then sent to the database through the cart functions (supabase/migrations/0005_cart_sync.sql).
 * Writes are serialised so they reach the database in the order the user made them.
 * Guests (userId === null) are local only.
 */
export const cartSyncControls = {
  /** Number of writes not yet confirmed by the database. */
  pending: 0,
  /** Set by <CartSync/>: re-reads the cart from the database. */
  refetch: null as null | (() => void),
};

let queue: Promise<unknown> = Promise.resolve();

function friendlyError(message: string): string {
  if (message.includes("OUT_OF_STOCK")) return "Sorry, that item is out of stock.";
  if (message.includes("VARIANT_UNAVAILABLE")) return "That item is no longer available.";
  return "We couldn't update your basket, so we refreshed it.";
}

type Result = { error: { message: string } | null };

function enqueue(run: () => PromiseLike<Result>, dispatch: Dispatch) {
  cartSyncControls.pending++;
  queue = queue
    .then(async () => {
      const { error } = await run();
      if (error) throw new Error(error.message);
    })
    .catch((err: unknown) => {
      dispatch(showToast(friendlyError(err instanceof Error ? err.message : String(err))));
    })
    .finally(() => {
      cartSyncControls.pending--;
      // Once every write is confirmed, align with the database (also fixes any optimistic drift).
      if (cartSyncControls.pending === 0) cartSyncControls.refetch?.();
    });
}

export const cartListener = createListenerMiddleware();

cartListener.startListening({
  matcher: isAnyOf(addItem, setQuantity, removeItem, clearCart),
  effect: (action, api) => {
    if (!(api.getState() as State).cart.userId) return;
    const supabase = createClient();
    const dispatch = api.dispatch as Dispatch;

    if (addItem.match(action)) {
      const { variantId, quantity } = action.payload;
      enqueue(() => supabase.rpc("add_to_cart", { p_variant_id: variantId, p_quantity: quantity ?? 1 }), dispatch);
    } else if (setQuantity.match(action)) {
      const { variantId, quantity } = action.payload;
      enqueue(() => supabase.rpc("set_cart_quantity", { p_variant_id: variantId, p_quantity: quantity }), dispatch);
    } else if (removeItem.match(action)) {
      enqueue(() => supabase.rpc("remove_from_cart", { p_variant_id: action.payload }), dispatch);
    } else if (clearCart.match(action)) {
      enqueue(() => supabase.rpc("clear_cart"), dispatch);
    }
  },
});

// The note changes on every keystroke: wait until typing pauses before saving.
cartListener.startListening({
  actionCreator: setNote,
  effect: async (action, api) => {
    api.cancelActiveListeners();
    await api.delay(700);
    if (!(api.getState() as State).cart.userId) return;
    const supabase = createClient();
    enqueue(() => supabase.rpc("set_cart_note", { p_note: action.payload }), api.dispatch as Dispatch);
  },
});
