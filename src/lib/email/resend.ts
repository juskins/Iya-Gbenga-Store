import "server-only";

export type SendResult = { ok: true; providerId: string | null } | { ok: false; error: string };

type Message = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Resend de-duplicates sends that share a key (valid for 24h), so retries never double-send. */
  idempotencyKey?: string;
};

const API_URL = "https://api.resend.com/emails";
const BACKOFF_MS = [500, 1500, 4000];
const REQUEST_TIMEOUT_MS = 10_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Network errors, 429 and 5xx are worth retrying; other 4xx (bad key, unverified domain, bad recipient) are not. */
const isRetryable = (status: number) => status === 429 || status >= 500;

/** Sends one email through the Resend HTTP API, retrying transient failures up to 3 times. Never throws. */
export async function sendEmail(message: Message): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return { ok: false, error: "Resend is not configured" };

  const replyTo = process.env.RESEND_REPLY_TO || undefined;
  const body = JSON.stringify({
    from,
    to: [message.to],
    subject: message.subject,
    text: message.text,
    html: message.html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
  };

  let lastError = "Unknown error";
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS[attempt - 1]);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });
      const raw = await res.text();
      if (res.ok) {
        let providerId: string | null = null;
        try {
          providerId = (JSON.parse(raw) as { id?: string }).id ?? null;
        } catch {
          /* non-JSON success body */
        }
        return { ok: true, providerId };
      }
      lastError = `HTTP ${res.status}: ${raw.slice(0, 300)}`;
      if (!isRetryable(res.status)) return { ok: false, error: lastError };
    } catch (e) {
      lastError = `Network error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return { ok: false, error: `${lastError} (gave up after ${BACKOFF_MS.length + 1} attempts)` };
}
