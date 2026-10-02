import "server-only";
import { sendViaResend } from "./resend";
import { sendViaSmtp } from "./smtp";
import type { EmailMessage, SendResult } from "./types";

/**
 * Picks the email provider from the environment. SMTP wins when SMTP_HOST is set
 * (works without a custom domain, e.g. Gmail); otherwise Resend (needs a verified domain
 * to deliver to anyone but the account owner).
 */
export function sendEmail(message: EmailMessage): Promise<SendResult> {
  return process.env.SMTP_HOST ? sendViaSmtp(message) : sendViaResend(message);
}
