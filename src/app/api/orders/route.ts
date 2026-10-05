import { NextResponse, type NextRequest } from "next/server";
import { authenticateBearer } from "@/lib/api/auth";
import { placeOrderForUser } from "@/lib/orders/placeOrder";

export const dynamic = "force-dynamic";

/** HTTP status for each failure code returned by placeOrderForUser. */
const STATUS: Record<string, number> = {
  UNAUTHENTICATED: 401,
  INVALID_INPUT: 400,
  INVALID_JSON: 400,
  INVALID_QUANTITY: 400,
  INVALID_PAYMENT_METHOD: 400,
  EMPTY_CART: 400,
  RATE_LIMITED: 429,
  OUT_OF_STOCK: 409,
  MAX_PER_ORDER: 409,
  VARIANT_UNAVAILABLE: 409,
  SHIPPING_UNAVAILABLE: 409,
  IDEMPOTENCY_KEY_CONFLICT: 409,
};

/**
 * POST /api/orders   (used by the mobile app; the website uses the checkout server action)
 * Headers: Authorization: Bearer <supabase access token>, Content-Type: application/json
 * Body:    { values: {...checkout fields}, idempotencyKey: uuid, items: [{variantId, quantity}], note: string }
 *          (see src/lib/validators/checkout.ts placeOrderSchema). Prices are never sent.
 * 201:     { ok: true, orderNumber, orderId, totalKobo }
 * 4xx/5xx: { ok: false, code, message, fieldErrors? }
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateBearer(request);
  if (!auth) {
    return NextResponse.json({ ok: false, code: "UNAUTHENTICATED", message: "Please sign in to place your order." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_JSON", message: "The request body must be valid JSON." }, { status: 400 });
  }

  const result = await placeOrderForUser({ userId: auth.user.id, userClient: auth.userClient, input: body });
  if (result.ok) return NextResponse.json(result, { status: 201 });
  return NextResponse.json(result, { status: STATUS[result.code] ?? 500 });
}
