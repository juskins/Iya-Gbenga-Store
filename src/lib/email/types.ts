export type SendResult = { ok: true; providerId: string | null } | { ok: false; error: string };

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Used by providers that support de-duplicating sends (Resend). SMTP ignores it. */
  idempotencyKey?: string;
};
