import Link from "next/link";
import Icon from "@/components/store/Icon";
import { formatNaira } from "@/lib/format";
import { SUPPORT_PHONE } from "@/lib/config";

export default function OrderSummary({ count, subtotalKobo }: { count: number; subtotalKobo: number }) {
  return (
    <aside aria-label="Order summary" className="lg:col-span-4 lg:sticky lg:top-40 flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold pb-3">Order Summary</h2>
        <dl className="flex flex-col gap-3 py-space-sm font-body-md text-body-md text-on-surface">
          <div className="flex items-center justify-between">
            <dt className="text-on-surface-variant">
              Subtotal ({count} {count === 1 ? "item" : "items"})
            </dt>
            <dd className="font-bold">{formatNaira(subtotalKobo)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-on-surface-variant">Delivery</dt>
            <dd className="font-label-md text-label-md text-on-surface-variant">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="rounded-xl p-4 my-2 bg-surface-container-low/60">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="font-title-md text-title-md text-on-surface font-bold block">Total</span>
              <span className="font-label-caps text-label-caps text-outline">Excludes delivery</span>
            </div>
            <span className="font-headline-lg text-headline-lg text-primary font-extrabold">{formatNaira(subtotalKobo)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-space-sm">
          <Link
            href="/checkout"
            className="group w-full bg-primary text-on-primary font-title-md text-title-md py-4 px-6 min-h-11 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all shadow-md"
          >
            <Icon name="lock" className="text-xl" />
            <span>Proceed to Checkout</span>
            <Icon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <ul className="mt-space-md pt-space-sm space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
          <li className="flex items-center gap-2">
            <Icon name="verified_user" className="text-primary text-base" />
            <span>Freshness and sand-free guarantee</span>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="schedule" className="text-primary text-base" />
            <span>Order before 2:00 PM for same-day dispatch</span>
          </li>
        </ul>
      </div>
      <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
          <Icon name="support_agent" className="text-2xl" />
        </div>
        <div className="flex flex-col">
          <span className="font-title-md text-title-md text-on-surface font-bold">Need custom market cuts?</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Call us on <strong className="text-primary">{SUPPORT_PHONE}</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}
