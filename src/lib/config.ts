/** Store-wide configuration. Move to the database/env as the backend lands. */
export const FREE_DELIVERY_THRESHOLD_KOBO = 35_000_00;
/** International format, digits only (e.g. 2348012345678). Set NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
/** Shown to customers and in emails. Set NEXT_PUBLIC_SUPPORT_PHONE (falls back to the WhatsApp number). */
export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? (WHATSAPP_NUMBER ? `+${WHATSAPP_NUMBER}` : "our support line");
export const ORDER_NOTE_MAX = 250;
