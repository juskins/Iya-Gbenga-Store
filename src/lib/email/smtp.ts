import "server-only";
import nodemailer from "nodemailer";
import type { EmailMessage, SendResult } from "./types";

const BACKOFF_MS = [500, 1500, 4000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** SMTP 4xx replies and connection problems are transient; 5xx (bad login, rejected recipient) are not. */
function isRetryable(err: unknown): boolean {
  const e = err as { responseCode?: number; code?: string };
  if (typeof e.responseCode === "number") return e.responseCode >= 400 && e.responseCode < 500;
  return ["ECONNECTION", "ETIMEDOUT", "ESOCKET", "ECONNRESET", "EDNS", "EPROTOCOL"].includes(e.code ?? "");
}

/** Sends one email over SMTP (e.g. Gmail with an app password), retrying transient failures. Never throws. */
export async function sendViaSmtp(message: EmailMessage): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!host || !user || !pass || !from) return { ok: false, error: "SMTP is not configured" };

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const replyTo = process.env.SMTP_REPLY_TO || undefined;
  let lastError = "Unknown error";
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS[attempt - 1]);
    try {
      const info = await transporter.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(replyTo ? { replyTo } : {}),
      });
      return { ok: true, providerId: info.messageId ?? null };
    } catch (e) {
      lastError = `SMTP error: ${e instanceof Error ? e.message : String(e)}`;
      if (!isRetryable(e)) return { ok: false, error: lastError.slice(0, 300) };
    }
  }
  return { ok: false, error: `${lastError.slice(0, 250)} (gave up after ${BACKOFF_MS.length + 1} attempts)` };
}
