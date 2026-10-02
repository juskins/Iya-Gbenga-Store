import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/store/Icon";
import { formatNaira } from "@/lib/format";
import { formatNgPhone } from "@/lib/validators/checkout";
import { PAYMENT_LABELS, type BankDetails, type OrderView } from "@/lib/types-order";
import CopyOrderNumber from "./CopyOrderNumber";
import OrderTimeline from "./OrderTimeline";

const shell = "max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-space-lg md:py-space-xl";
const card = "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm";

export default function OrderConfirmation({ order, bank }: { order: OrderView; bank: BankDetails | null }) {
  const { address } = order;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const isTransfer = order.paymentMethod === "bank_transfer";
  const isPaid = order.paymentStatus === "paid";
  const placedAt = new Date(order.createdAt).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

  return (
    <div className={`${shell} flex flex-col gap-space-xl`}>
      {/* Success banner */}
      <section
        aria-labelledby="confirmation-heading"
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-surface-tint text-on-primary p-space-lg md:p-space-xl shadow-xl"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="flex items-start md:items-center gap-space-md">
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-on-primary/10 flex items-center justify-center">
              <Icon name="check_circle" filled className="!text-4xl md:!text-5xl text-primary-fixed" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-on-primary/15 text-primary-fixed font-label-caps text-label-caps uppercase tracking-wider mb-2 w-fit">
                Order received
              </div>
              <h1 id="confirmation-heading" className="font-headline-lg md:font-headline-xl text-headline-lg md:text-headline-xl text-on-primary font-extrabold tracking-tight">
                Ẹ ṣé gan-an! Your order has been placed.
              </h1>
              <p className="font-body-md text-body-md text-on-primary-container max-w-2xl mt-1">
                Thank you for shopping with Iya Gbenga&rsquo;s Store. We will send your order confirmation to:
              </p>
              <div className="flex flex-wrap items-center gap-space-sm mt-3 font-label-md text-label-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/10 text-on-primary break-all">
                  <Icon name="mail" className="!text-sm text-primary-fixed" />
                  {order.email}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/10 text-on-primary">
                  <Icon name="call" className="!text-sm text-primary-fixed" />
                  {formatNgPhone(order.phone)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-start lg:items-end justify-center bg-on-primary/10 p-space-md rounded-xl">
            <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider">Order number</span>
            <span className="font-headline-lg text-headline-lg text-on-primary font-mono font-bold tracking-tight break-all">
              #{order.orderNumber}
            </span>
            <span className="font-body-sm text-body-sm text-on-primary-container mt-1">Placed {placedAt}</span>
            <CopyOrderNumber orderNumber={order.orderNumber} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
        {/* Left: timeline + payment */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <OrderTimeline status={order.status} placedAt={placedAt} shippingName={order.shippingMethodName} events={order.events} />

          <section className={`${card} flex flex-col gap-space-md`} aria-labelledby="payment-heading">
            <div className="flex items-center gap-2">
              <Icon name="account_balance_wallet" className="text-primary !text-2xl" />
              <h2 id="payment-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
                Payment: {PAYMENT_LABELS[order.paymentMethod]}
              </h2>
              <span className="ml-auto px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase font-bold">
                {isPaid ? "Paid" : "Pending payment"}
              </span>
            </div>
            {isTransfer ? (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Please transfer <strong className="text-on-surface">{formatNaira(order.totalKobo)}</strong> and use your order number{" "}
                  <strong className="text-on-surface font-mono">{order.orderNumber}</strong> as the payment reference. We confirm your order once the
                  payment is received.
                </p>
                {bank ? (
                  <dl className="bg-surface-container-low rounded-lg p-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-body-sm text-body-sm">
                    <dt className="text-outline">Bank</dt>
                    <dd className="text-on-surface font-semibold">{bank.bankName}</dd>
                    <dt className="text-outline">Account name</dt>
                    <dd className="text-on-surface font-semibold">{bank.accountName}</dd>
                    <dt className="text-outline">Account number</dt>
                    <dd className="text-on-surface font-semibold font-mono">{bank.accountNumber}</dd>
                  </dl>
                ) : (
                  <p className="bg-surface-container-low rounded-lg p-4 font-body-sm text-body-sm text-on-surface-variant">
                    We will contact you shortly with our payment details.
                  </p>
                )}
              </>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Pay <strong className="text-on-surface">{formatNaira(order.totalKobo)}</strong> to the rider when your groceries arrive. Please keep your
                phone close so we can reach you.
              </p>
            )}
          </section>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <section className={`${card} shadow-md flex flex-col`} aria-labelledby="summary-heading">
            <div className="flex items-center justify-between pb-space-sm">
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Order summary</span>
                <h2 id="summary-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
                  Your items
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps uppercase font-bold">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="flex flex-col gap-space-md py-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3.5 bg-surface-container-low/60 p-2.5 rounded-lg">
                  <div className="relative w-16 h-16 rounded-md bg-surface-container-highest flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-outline">
                        <Icon name="shopping_basket" className="!text-2xl" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-title-md text-body-md font-semibold text-on-surface line-clamp-2">{item.productName}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.variantLabel} · {item.quantity} × {formatNaira(item.unitPriceKobo)}
                    </p>
                  </div>
                  <span className="font-price-card text-body-md font-bold text-on-surface">{formatNaira(item.unitPriceKobo * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-on-surface font-semibold">{formatNaira(order.subtotalKobo)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{order.shippingMethodName}</dt>
                <dd className="text-on-surface font-semibold">{order.shippingKobo === 0 ? "Free" : formatNaira(order.shippingKobo)}</dd>
              </div>
              {order.discountKobo > 0 && (
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="text-on-surface font-semibold">-{formatNaira(order.discountKobo)}</dd>
                </div>
              )}
              <div className="h-px bg-outline-variant my-1" />
              <div className="flex items-baseline justify-between">
                <dt className="font-title-md text-title-md text-on-surface font-bold">Total</dt>
                <dd className="font-price-xl text-price-xl text-primary font-extrabold">{formatNaira(order.totalKobo)}</dd>
              </div>
            </dl>

            <div className="mt-4 bg-surface-container-low rounded-lg p-4">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider flex items-center gap-1">
                <Icon name="location_on" className="!text-sm" /> Delivery address
              </span>
              <address className="not-italic mt-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="block text-on-surface font-semibold">{address.recipient}</span>
                {address.street}
                {address.unit && <>, {address.unit}</>}
                <br />
                {address.lga}, {address.state === "Abuja FCT" ? address.state : `${address.state} State`}
                {address.landmark && (
                  <>
                    <br />
                    <span className="text-outline">Note: </span>
                    {address.landmark}
                  </>
                )}
              </address>
            </div>
            {order.note && (
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
                <span className="text-outline">Order note: </span>
                {order.note}
              </p>
            )}
          </section>

          <section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-3">
            <h2 className="font-title-md text-title-md text-on-surface font-bold">Need something else for your soup?</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Keep shopping, or check your order any time in your account.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/groceries"
                className="flex-1 inline-flex items-center justify-center min-h-11 px-4 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account/orders"
                className="flex-1 inline-flex items-center justify-center min-h-11 px-4 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-container text-center"
              >
                View in Account
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
