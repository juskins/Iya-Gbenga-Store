import Icon from "@/components/store/Icon";
import { FREE_DELIVERY_THRESHOLD_KOBO } from "@/lib/config";
import { formatNaira } from "@/lib/format";

export default function FreeDeliveryBar({ subtotalKobo }: { subtotalKobo: number }) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD_KOBO - subtotalKobo);
  const unlocked = remaining === 0;
  const pct = Math.min(100, (subtotalKobo / FREE_DELIVERY_THRESHOLD_KOBO) * 100);

  return (
    <section
      aria-label="Free delivery progress"
      className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm relative z-10 mb-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="local_shipping" className="text-2xl" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Free Delivery Goal</h2>
              <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-2 py-0.5 rounded-full uppercase">
                Lagos Only
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {unlocked ? (
                <span className="text-primary font-bold">You have unlocked FREE delivery in Lagos!</span>
              ) : (
                <>
                  Add <span className="font-bold text-secondary">{formatNaira(remaining)}</span> more to unlock{" "}
                  <span className="text-primary font-bold">FREE delivery</span> in Lagos.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="md:text-right shrink-0">
          <span className="font-label-caps text-label-caps text-outline uppercase block">Current basket total</span>
          <span className="font-price-xl text-price-xl text-primary font-bold">
            {formatNaira(subtotalKobo)}{" "}
            <span className="text-body-sm font-normal text-on-surface-variant">/ {formatNaira(FREE_DELIVERY_THRESHOLD_KOBO)}</span>
          </span>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="Progress towards free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden mt-space-xs"
      >
        <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between items-center mt-2 font-label-caps text-label-caps text-on-surface-variant">
        <span>{formatNaira(0)}</span>
        <span className="text-primary font-bold">{pct.toFixed(1)}% complete</span>
        <span className="text-secondary font-bold">{formatNaira(FREE_DELIVERY_THRESHOLD_KOBO)} goal</span>
      </div>
    </section>
  );
}
