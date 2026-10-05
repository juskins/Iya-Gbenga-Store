"use server";

import { placeOrderForUser } from "@/lib/orders/placeOrder";
import { createClient } from "@/lib/supabase/server";
import type { PlaceOrderInput, PlaceOrderResult } from "@/lib/validators/checkout";

/** Website checkout. The session cookie identifies the user; never trust a client-supplied id. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "UNAUTHENTICATED", message: "Please sign in to place your order." };
  return placeOrderForUser({ userId: user.id, userClient: supabase, input });
}
