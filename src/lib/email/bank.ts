import "server-only";
import type { BankDetails } from "@/lib/types-order";

/** Bank transfer details from env. Returns null unless all three are set. */
export function getBankDetails(): BankDetails | null {
  const bankName = process.env.BANK_NAME?.trim();
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER?.trim();
  const accountName = process.env.BANK_ACCOUNT_NAME?.trim();
  if (!bankName || !accountNumber || !accountName) return null;
  return { bankName, accountNumber, accountName };
}
