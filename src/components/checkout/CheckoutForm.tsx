"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Icon from "@/components/store/Icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart, selectCartCount, selectCartSubtotal } from "@/store/cartSlice";
import { SUPPORT_PHONE } from "@/lib/config";
import type { ShippingMethod } from "@/lib/data/catalog";
import { formatNaira } from "@/lib/format";
import { checkoutSchema, LGAS_BY_STATE, normalizePhone, STATES, type CheckoutValues } from "@/lib/validators/checkout";
import Field, { inputClass } from "./Field";
import CheckoutStepper from "./CheckoutStepper";
import OrderSummary from "./OrderSummary";
import { placeOrder } from "@/app/checkout/actions";

const card = "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-5";

export type CheckoutPrefill = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  unit: string;
  state: string;
  lga: string;
  landmark: string;
  hasDefaultAddress: boolean;
};

const KEY_STORAGE = "iya-gbenga-checkout-key";

/** One idempotency key per checkout attempt: survives retries/refreshes, rotated only after success. */
function readStoredKey(): string | null {
  try {
    return sessionStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}
function storeKey(key: string) {
  try {
    sessionStorage.setItem(KEY_STORAGE, key);
  } catch {
    /* in-memory ref still protects this page view */
  }
}
function clearStoredKey() {
  try {
    sessionStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

/** "12:00:00" -> "Order by 12:00 PM" */
function formatCutoff(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return `Order by ${h % 12 === 0 ? 12 : h % 12}:${String(m ?? 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

const isFreeFor = (m: ShippingMethod, subtotalKobo: number) => m.freeAboveKobo !== null && subtotalKobo >= m.freeAboveKobo;

export default function CheckoutForm({ shippingMethods, prefill }: { shippingMethods: ShippingMethod[]; prefill: CheckoutPrefill }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, note, hydrated } = useAppSelector((s) => s.cart);
  const count = useAppSelector(selectCartCount);
  const subtotalKobo = useAppSelector(selectCartSubtotal);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const busyRef = useRef(false); // synchronous double-submit lock
  const keyRef = useRef<string | null>(null);

  const defaultValues: CheckoutValues = {
    firstName: prefill.firstName,
    lastName: prefill.lastName,
    email: prefill.email,
    phone: prefill.phone,
    street: prefill.street,
    unit: prefill.unit,
    state: prefill.state,
    lga: prefill.lga,
    landmark: prefill.landmark,
    shippingMethod: shippingMethods[0]?.id ?? "",
    paymentMethod: "pay_on_delivery",
    saveAsDefault: !prefill.hasDefaultAddress,
  };
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues,
  });

  const state = useWatch({ control, name: "state" });
  const shippingId = useWatch({ control, name: "shippingMethod" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const phoneValue = useWatch({ control, name: "phone" });

  const method = shippingMethods.find((m) => m.id === shippingId);
  const shippingKobo = method ? (isFreeFor(method, subtotalKobo) ? 0 : method.priceKobo) : 0;
  const freeThresholds = shippingMethods.map((m) => m.freeAboveKobo).filter((v): v is number => v !== null);
  const freeThreshold = freeThresholds.length ? Math.min(...freeThresholds) : null;
  const totalKobo = subtotalKobo + shippingKobo;
  const lagosOnly = state !== "Lagos";
  const phoneOk = /^0[7-9][01]\d{8}$/.test(normalizePhone(phoneValue ?? ""));

  if (!hydrated || placed) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-space-xl" role="status" aria-live="polite">
        <p className="font-body-md text-body-md text-on-surface-variant">{placed ? "Placing your order…" : "Loading your checkout…"}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-margin-mobile py-space-xl text-center flex flex-col items-center gap-4">
        <span className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center">
          <Icon name="shopping_basket" className="!text-4xl text-primary" />
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary font-bold">Your basket is empty</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Add a few groceries to your basket and come back to check out.
        </p>
        <Link
          href="/groceries"
          className="inline-flex items-center justify-center min-h-11 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container"
        >
          Browse groceries
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: CheckoutValues) => {
    if (busyRef.current) return; // double-submit protection
    busyRef.current = true;
    setSubmitError(null);
    try {
      if (!keyRef.current) {
        keyRef.current = readStoredKey() ?? crypto.randomUUID();
        storeKey(keyRef.current);
      }
      const result = await placeOrder({
        values,
        idempotencyKey: keyRef.current,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        note,
      });

      if (result.ok) {
        clearStoredKey();
        keyRef.current = null;
        setPlaced(true);
        dispatch(clearCart());
        router.push(`/order-confirmation/${encodeURIComponent(result.orderNumber)}`);
        return;
      }

      // Cart and form values are preserved so the customer can retry.
      if (result.code === "UNAUTHENTICATED") {
        router.push("/login?next=/checkout");
        return;
      }
      if (result.code === "IDEMPOTENCY_KEY_CONFLICT") {
        clearStoredKey();
        keyRef.current = null;
      }
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as keyof CheckoutValues, { message });
      }
      busyRef.current = false;
      setSubmitError(result.message);
    } catch {
      busyRef.current = false;
      setSubmitError("We could not place your order. Your basket and details are saved. Please try again.");
    }
  };

  const lgas = LGAS_BY_STATE[state] ?? [];
  const radioCard = (selected: boolean) =>
    `relative flex items-center justify-between gap-3 p-4 min-h-11 rounded-xl cursor-pointer shadow-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
      selected ? "bg-primary-fixed/20 hover:bg-primary-fixed/30" : "bg-surface-container-low hover:bg-surface-container"
    }`;

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-space-lg">
      <div className="mb-space-lg bg-surface-container-lowest p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">
              Authentic Nigerian Groceries
            </span>
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">Checkout</h1>
          </div>
          <CheckoutStepper current={isValid ? 3 : 1} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
        <form
          id="checkout-form"
          onSubmit={(e) => handleSubmit(onSubmit)(e)}
          noValidate
          className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg"
        >
          {submitError && (
            <div role="alert" className="bg-error-container p-4 rounded-xl flex items-start gap-2.5 text-on-error-container">
              <Icon name="error" className="!text-xl" />
              <p className="font-body-sm text-body-sm">{submitError}</p>
            </div>
          )}

          {/* 1. Delivery */}
          <section className={card} aria-labelledby="delivery-heading">
            <div className="flex items-center gap-2 pb-2">
              <Icon name="location_on" className="text-primary !text-xl" />
              <h2 id="delivery-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
                1. Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="firstName" label="First Name" error={errors.firstName?.message}>
                {(a) => <input {...a} type="text" autoComplete="given-name" className={inputClass} {...register("firstName")} />}
              </Field>
              <Field id="lastName" label="Last Name" error={errors.lastName?.message}>
                {(a) => <input {...a} type="text" autoComplete="family-name" className={inputClass} {...register("lastName")} />}
              </Field>
            </div>

            <Field id="email" label="Email" error={errors.email?.message} hint="We send your order confirmation here.">
              {(a) => <input {...a} type="email" autoComplete="email" inputMode="email" className={inputClass} {...register("email")} />}
            </Field>

            <Field
              id="phone"
              label="Mobile Number (Nigerian)"
              error={errors.phone?.message}
              hint={phoneOk ? undefined : "Our rider or store will call this number about your delivery."}
            >
              {(a) => (
                <div className="relative">
                  <div className="absolute left-3.5 inset-y-0 flex items-center gap-1 text-on-surface font-label-md text-label-md pointer-events-none">
                    <span aria-hidden="true">🇳🇬</span>
                    <span>+234</span>
                    <span className="text-outline-variant" aria-hidden="true">
                      |
                    </span>
                  </div>
                  <input
                    {...a}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="0803 456 7890"
                    className={`${inputClass} pl-24`}
                    {...register("phone")}
                  />
                </div>
              )}
            </Field>

            <Field id="street" label="Street Address" error={errors.street?.message}>
              {(a) => <input {...a} type="text" autoComplete="street-address" className={inputClass} {...register("street")} />}
            </Field>

            <Field id="unit" label="Apartment / Suite / Gate Code" optional error={errors.unit?.message}>
              {(a) => <input {...a} type="text" autoComplete="address-line2" className={inputClass} {...register("unit")} />}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="state" label="State" error={errors.state?.message}>
                {(a) => (
                  <select
                    {...a}
                    autoComplete="address-level1"
                    className={`${inputClass} cursor-pointer`}
                    {...register("state", { onChange: () => setValue("lga", "", { shouldValidate: false }) })}
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s === "Abuja FCT" ? s : `${s} State`}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field id="lga" label="LGA / Area" error={errors.lga?.message}>
                {(a) => (
                  <select {...a} className={`${inputClass} cursor-pointer`} {...register("lga")}>
                    <option value="">Select area</option>
                    {lgas.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <Field id="landmark" label="Landmark & Delivery Instructions" optional error={errors.landmark?.message}>
              {(a) => (
                <textarea
                  {...a}
                  rows={2}
                  placeholder="e.g. Blue gate opposite the pharmacy. Call at the gate."
                  className={inputClass}
                  {...register("landmark")}
                />
              )}
            </Field>

            <label className="flex items-center gap-3 min-h-11 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary rounded-lg">
              <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer shrink-0" {...register("saveAsDefault")} />
              <span className="font-label-md text-label-md text-on-surface">Save as my default address</span>
            </label>
          </section>

          {/* 2. Shipping */}
          <section className={card} aria-labelledby="shipping-heading">
            <div className="flex items-center gap-2">
              <Icon name="local_shipping" className="text-primary !text-xl" />
              <h2 id="shipping-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
                2. Shipping Method
              </h2>
            </div>

            {lagosOnly && (
              <div role="alert" className="bg-error-container/40 p-3 rounded-xl flex items-start gap-2.5">
                <Icon name="info" className="text-error !text-lg" />
                <p className="font-body-sm text-body-sm text-error">
                  We currently deliver within Lagos only. Select Lagos State to continue. For orders elsewhere, contact us on{" "}
                  {SUPPORT_PHONE}.
                </p>
              </div>
            )}

            <fieldset className="flex flex-col gap-3 border-0 p-0 m-0 min-w-0">
              <legend className="sr-only">Choose a shipping method</legend>
              {shippingMethods.length === 0 && (
                <p className="font-body-sm text-body-sm text-error">
                  Delivery options are unavailable right now. Please try again shortly or contact us on {SUPPORT_PHONE}.
                </p>
              )}
              {shippingMethods.map((m) => {
                const price = isFreeFor(m, subtotalKobo) ? 0 : m.priceKobo;
                const cutoff = formatCutoff(m.cutoffTime);
                return (
                  <label key={m.id} className={radioCard(shippingId === m.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="radio" value={m.id} className="w-5 h-5 accent-primary cursor-pointer shrink-0" {...register("shippingMethod")} />
                      <div className="min-w-0">
                        <span className="font-label-md text-label-md text-primary font-bold">{m.name}</span>
                        {cutoff && <p className="font-body-sm text-body-sm text-outline">{cutoff}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-price-card text-price-card text-primary">{price === 0 ? "FREE" : formatNaira(price)}</span>
                      <span className="block font-label-caps text-[10px] text-outline">{m.etaText}</span>
                    </div>
                  </label>
                );
              })}
            </fieldset>
            {freeThreshold !== null && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Free delivery on orders over {formatNaira(freeThreshold)} (delivery options only).
              </p>
            )}
            {errors.shippingMethod && (
              <p role="alert" className="font-body-sm text-body-sm text-error">
                {errors.shippingMethod.message}
              </p>
            )}
          </section>

          {/* 3. Payment */}
          <section className={card} aria-labelledby="payment-heading">
            <div className="flex items-center gap-2">
              <Icon name="account_balance_wallet" className="text-primary !text-xl" />
              <h2 id="payment-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
                3. Payment Method
              </h2>
            </div>
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-0 p-0 m-0 min-w-0">
              <legend className="sr-only">Choose a payment method</legend>
              {(
                [
                  { id: "pay_on_delivery", title: "Pay on Delivery", text: "Pay the rider when your groceries arrive." },
                  { id: "bank_transfer", title: "Bank Transfer", text: "Transfer after ordering. Bank details are on the next page." },
                ] as const
              ).map((p) => (
                <label key={p.id} className={`${radioCard(paymentMethod === p.id)} items-start`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" value={p.id} className="w-5 h-5 mt-0.5 accent-primary cursor-pointer shrink-0" {...register("paymentMethod")} />
                    <div>
                      <p className="font-label-md text-label-md text-primary font-bold">{p.title}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{p.text}</p>
                    </div>
                  </div>
                </label>
              ))}
            </fieldset>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-2">
              <Icon name="info" className="!text-base mt-0.5" />
              Your order stays as &ldquo;Pending payment&rdquo; until the store confirms it. We never ask for card details here.
            </p>
          </section>
        </form>

        <div className="lg:col-span-5 xl:col-span-4">
          <OrderSummary
            items={items}
            count={count}
            subtotalKobo={subtotalKobo}
            shippingKobo={shippingKobo}
            shippingLabel={method?.name ?? "Delivery"}
            totalKobo={totalKobo}
            submitting={isSubmitting}
            canSubmit={!lagosOnly && Boolean(method)}
          />
        </div>
      </div>
    </div>
  );
}
