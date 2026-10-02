const nairaFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 0,
});

/** Money is stored as integer kobo; display as ₦ with thousands separators. */
export function formatNaira(kobo: number): string {
  return `₦${nairaFormatter.format(Math.round(kobo / 100))}`;
}
