import { NextResponse, type NextRequest } from "next/server";
import { authenticateBearer } from "@/lib/api/auth";
import { getBankDetails } from "@/lib/email/bank";
import { FREE_DELIVERY_THRESHOLD_KOBO, SUPPORT_PHONE, WHATSAPP_NUMBER } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/store-config   (signed-in users only, Authorization: Bearer <access token>)
 * Settings that live in the website's server environment and are not in the database:
 * contact numbers, the free-delivery threshold and the bank-transfer details.
 * Keeps the mobile app in step with the website without hard-coding any of it.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateBearer(request);
  if (!auth) {
    return NextResponse.json({ ok: false, code: "UNAUTHENTICATED", message: "Please sign in." }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    whatsappNumber: WHATSAPP_NUMBER || null,
    supportPhone: SUPPORT_PHONE,
    freeDeliveryThresholdKobo: FREE_DELIVERY_THRESHOLD_KOBO,
    bankTransfer: getBankDetails(),
  });
}
