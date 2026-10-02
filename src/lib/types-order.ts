/** Order shapes shared by checkout, confirmation and email. Money is integer kobo. */
export type PaymentMethod = "pay_on_delivery" | "bank_transfer";

export type OrderStatus = "pending" | "confirmed" | "packing" | "dispatched" | "delivered" | "cancelled";

/** Snapshot stored in orders.shipping_address (jsonb). Phone is E.164 (+234...). */
export type OrderAddress = {
  recipient: string;
  phone: string;
  street: string;
  unit: string;
  state: string;
  lga: string;
  landmark: string;
};

export type OrderItemView = {
  id: string;
  productName: string;
  variantLabel: string;
  unitPriceKobo: number;
  quantity: number;
  image: string | null;
};

export type OrderEventView = {
  status: string;
  note: string | null;
  createdAt: string; // ISO
};

export type OrderView = {
  orderNumber: string;
  createdAt: string; // ISO
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  email: string;
  phone: string;
  address: OrderAddress;
  items: OrderItemView[];
  note: string | null;
  shippingMethodName: string;
  subtotalKobo: number;
  shippingKobo: number;
  discountKobo: number;
  totalKobo: number;
  events: OrderEventView[];
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pay_on_delivery: "Pay on Delivery",
  bank_transfer: "Bank Transfer",
};

/** Bank details for transfers, read from env on the server. null when not configured. */
export type BankDetails = { bankName: string; accountNumber: string; accountName: string };
