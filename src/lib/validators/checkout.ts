import { z } from "zod";

/** Nigerian mobile as typed by the customer (spaces/dashes allowed): 0[7-9][01]XXXXXXXX. */
export const NG_MOBILE = /^0[7-9][01]\d{8}$/;
export const normalizePhone = (v: string) => v.replace(/[\s-]/g, "");

/** 0803 456 7890 -> +2348034567890 (stored form). */
export const toE164 = (v: string) => `+234${normalizePhone(v).slice(1)}`;

/** +2348034567890 -> 08034567890 (form form). Returns "" if it is not a Nigerian number. */
export function toLocalPhone(v: string | null | undefined): string {
  const d = (v ?? "").replace(/[\s-]/g, "");
  if (d.startsWith("+234")) return `0${d.slice(4)}`;
  if (d.startsWith("234")) return `0${d.slice(3)}`;
  return d;
}

/** +2348034567890 -> +234 803 456 7890 (display form). */
export function formatNgPhone(v: string): string {
  const d = v.replace(/[\s-]/g, "");
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(d);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : v;
}

export const STATES = ["Lagos", "Ogun", "Abuja FCT", "Oyo"] as const;

export const LGAS_BY_STATE: Record<string, string[]> = {
  Lagos: [
    "Lekki / Eti-Osa",
    "Ajah / Sangotedo",
    "Ikoyi / Victoria Island",
    "Ikeja",
    "Surulere",
    "Yaba / Mainland",
    "Maryland / Ikorodu Road",
    "Festac / Amuwo-Odofin",
  ],
  Ogun: ["Abeokuta South", "Sagamu", "Ifo"],
  "Abuja FCT": ["Garki", "Wuse", "Maitama"],
  Oyo: ["Ibadan North", "Ibadan South-West"],
};

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(60, "That name is too long"),
  lastName: z.string().trim().min(1, "Enter your last name").max(60, "That name is too long"),
  email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address, e.g. name@example.com"),
  phone: z
    .string()
    .min(1, "Enter your mobile number")
    .refine((v) => NG_MOBILE.test(normalizePhone(v)), "Enter a valid Nigerian mobile number, e.g. 0803 456 7890"),
  street: z.string().trim().min(5, "Enter your street address").max(150, "Keep the street address under 150 characters"),
  unit: z.string().trim().max(100, "Keep this under 100 characters"),
  state: z
    .string()
    .min(1, "Select your state")
    .refine((v): boolean => v === "Lagos", "We only deliver within Lagos for now"),
  lga: z.string().min(1, "Select your LGA / area"),
  landmark: z.string().trim().max(250, "Keep this under 250 characters"),
  /** shipping_methods.id (uuid) from the database. */
  shippingMethod: z.string().uuid("Select a shipping method"),
  paymentMethod: z.enum(["pay_on_delivery", "bank_transfer"]),
  saveAsDefault: z.boolean(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const orderItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

/** Everything the browser sends when placing an order. Prices are deliberately absent. */
export const placeOrderSchema = z.object({
  values: checkoutSchema,
  idempotencyKey: z.string().uuid(),
  items: z.array(orderItemInputSchema).min(1, "Your basket is empty").max(50),
  note: z.string().max(1000),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; orderId: string; totalKobo: number }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Partial<Record<keyof CheckoutValues, string>>;
    };
