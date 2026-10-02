import "server-only";
import { SUPPORT_PHONE } from "@/lib/config";
import { formatNaira } from "@/lib/format";
import { formatNgPhone } from "@/lib/validators/checkout";
import { PAYMENT_LABELS, type BankDetails, type OrderAddress, type PaymentMethod } from "@/lib/types-order";

export type EmailOrder = {
  orderNumber: string;
  createdAt: string;
  email: string;
  paymentMethod: PaymentMethod;
  shippingMethodName: string;
  address: OrderAddress;
  items: { productName: string; variantLabel: string; unitPriceKobo: number; quantity: number }[];
  note: string | null;
  subtotalKobo: number;
  shippingKobo: number;
  discountKobo: number;
  totalKobo: number;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = escapeHtml;

function paymentLines(order: EmailOrder, bank: BankDetails | null): string[] {
  if (order.paymentMethod === "pay_on_delivery") {
    return [`Pay ${formatNaira(order.totalKobo)} to the rider when your groceries arrive.`];
  }
  if (!bank) {
    return [
      `Please pay ${formatNaira(order.totalKobo)} by bank transfer.`,
      "We will contact you shortly with our payment details.",
      `Use ${order.orderNumber} as the payment reference.`,
    ];
  }
  return [
    `Please transfer ${formatNaira(order.totalKobo)} and use ${order.orderNumber} as the payment reference.`,
    `Bank: ${bank.bankName}`,
    `Account name: ${bank.accountName}`,
    `Account number: ${bank.accountNumber}`,
    "We confirm your order once the payment is received.",
  ];
}

function addressLines(a: OrderAddress): string[] {
  return [
    a.recipient,
    a.unit ? `${a.street}, ${a.unit}` : a.street,
    `${a.lga}, ${a.state}`,
    formatNgPhone(a.phone),
    ...(a.landmark ? [`Note: ${a.landmark}`] : []),
  ];
}

const placed = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export const orderEmailSubject = (order: EmailOrder) => `Your Iya Gbenga's Store order ${order.orderNumber}`;

export function renderOrderText(order: EmailOrder, bank: BankDetails | null): string {
  const lines: string[] = [
    `Thank you for shopping with Iya Gbenga's Store, ${order.address.recipient}!`,
    "",
    `Order number: ${order.orderNumber}`,
    `Placed: ${placed(order.createdAt)}`,
    "",
    "ITEMS",
    ...order.items.map(
      (i) => `- ${i.productName} (${i.variantLabel}) x ${i.quantity}: ${formatNaira(i.unitPriceKobo * i.quantity)}`,
    ),
    "",
    `Subtotal: ${formatNaira(order.subtotalKobo)}`,
    `${order.shippingMethodName}: ${order.shippingKobo === 0 ? "Free" : formatNaira(order.shippingKobo)}`,
    ...(order.discountKobo > 0 ? [`Discount: -${formatNaira(order.discountKobo)}`] : []),
    `Total: ${formatNaira(order.totalKobo)}`,
    "",
    `PAYMENT: ${PAYMENT_LABELS[order.paymentMethod]}`,
    ...paymentLines(order, bank),
    "",
    "DELIVERY ADDRESS",
    ...addressLines(order.address),
    `Shipping method: ${order.shippingMethodName}`,
    ...(order.note ? ["", `Order note: ${order.note}`] : []),
    "",
    `Questions? Call us on ${SUPPORT_PHONE} or reply to this email.`,
  ];
  return lines.join("\n");
}

export function renderOrderHtml(order: EmailOrder, bank: BankDetails | null): string {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;color:#555">${label}</td><td style="padding:4px 0;text-align:right;${strong ? "font-weight:bold;font-size:16px;" : ""}">${value}</td></tr>`;

  const itemRows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${e(i.productName)}<br><span style="color:#777;font-size:13px">${e(i.variantLabel)} &times; ${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${e(formatNaira(i.unitPriceKobo * i.quantity))}</td>
      </tr>`,
    )
    .join("");

  const payment = paymentLines(order, bank)
    .map((l) => `<p style="margin:4px 0">${e(l)}</p>`)
    .join("");
  const address = addressLines(order.address)
    .map((l) => e(l))
    .join("<br>");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4ef"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;padding:24px">
<tr><td>
  <h1 style="margin:0 0 8px;font-size:22px;color:#1b5e20">Thank you for your order!</h1>
  <p style="margin:0 0 16px">Hi ${e(order.address.recipient)}, we have received your order and will confirm it shortly.</p>
  <p style="margin:0 0 4px"><strong>Order number:</strong> ${e(order.orderNumber)}</p>
  <p style="margin:0 0 20px;color:#555">Placed ${e(placed(order.createdAt))}</p>

  <h2 style="font-size:16px;margin:0 0 8px">Items</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">
    ${row("Subtotal", e(formatNaira(order.subtotalKobo)))}
    ${row(e(order.shippingMethodName), order.shippingKobo === 0 ? "Free" : e(formatNaira(order.shippingKobo)))}
    ${order.discountKobo > 0 ? row("Discount", `-${e(formatNaira(order.discountKobo))}`) : ""}
    ${row("Total", e(formatNaira(order.totalKobo)), true)}
  </table>

  <h2 style="font-size:16px;margin:24px 0 8px">Payment: ${e(PAYMENT_LABELS[order.paymentMethod])}</h2>
  <div style="background:#f6f4ef;border-radius:8px;padding:12px">${payment}</div>

  <h2 style="font-size:16px;margin:24px 0 8px">Delivery</h2>
  <p style="margin:0 0 4px"><strong>${e(order.shippingMethodName)}</strong></p>
  <p style="margin:0">${address}</p>
  ${order.note ? `<p style="margin:12px 0 0;color:#555"><strong>Order note:</strong> ${e(order.note)}</p>` : ""}

  <p style="margin:24px 0 0;color:#555;font-size:14px">Questions? Call us on ${e(SUPPORT_PHONE)} or reply to this email.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
