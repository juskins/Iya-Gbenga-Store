import Icon from "@/components/store/Icon";

const STEPS = [
  { key: "received", title: "Order Received", icon: "inventory", text: "We have your order and will confirm it shortly." },
  { key: "packing", title: "Packing", icon: "hourglass_top", text: "Your groceries are picked and packed." },
  { key: "dispatched", title: "Dispatched", icon: "two_wheeler", text: "Your order is on its way, or ready for pickup." },
  { key: "delivered", title: "Delivered", icon: "home_pin", text: "Your order has arrived. Enjoy!" },
] as const;

/** Index of the furthest completed step for an order status. */
const REACHED: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  packing: 1,
  dispatched: 2,
  delivered: 3,
  cancelled: 0,
};

/** Order status that marks each step in order_events. */
const STEP_STATUS = ["pending", "packing", "dispatched", "delivered"] as const;

type TimelineEvent = { status: string; createdAt?: string; created_at?: string };

type Props = {
  status: string;
  /** Pre-formatted placed time; derived from events when omitted. */
  placedAt?: string;
  shippingName?: string;
  etaText?: string;
  /** order_events rows: used to show when each step happened. */
  events?: TimelineEvent[];
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export default function OrderTimeline({ status, placedAt, shippingName, etaText, events }: Props) {
  const reached = REACHED[status] ?? 0;
  const whenFor = (stepIndex: number): string | undefined => {
    if (stepIndex === 0 && placedAt) return placedAt;
    const ev = events?.find((e) => e.status === STEP_STATUS[stepIndex]);
    const iso = ev?.createdAt ?? ev?.created_at;
    return iso ? formatWhen(iso) : undefined;
  };
  const pill = [shippingName, etaText].filter(Boolean).join(" · ");
  const progress = (reached / (STEPS.length - 1)) * 100;

  return (
    <section className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg" aria-labelledby="timeline-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="local_shipping" filled className="text-primary !text-2xl" />
          <h2 id="timeline-heading" className="font-headline-sm text-headline-sm text-primary font-bold">
            Order status
          </h2>
        </div>
        {pill && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps tracking-wider uppercase font-bold">
            {pill}
          </span>
        )}
      </div>

      {status === "cancelled" && (
        <p role="status" className="bg-error-container text-on-error-container rounded-xl p-3 font-body-sm text-body-sm">
          This order has been cancelled.
        </p>
      )}

      <ol className="relative pl-6 md:pl-8 flex flex-col gap-8 my-2">
        <div aria-hidden="true" className="absolute left-2.5 md:left-3.5 top-3 bottom-4 w-1 bg-surface-container-highest rounded-full">
          <div className="w-full bg-primary rounded-full" style={{ height: `${progress}%` }} />
        </div>
        {STEPS.map((step, i) => {
          const done = i < reached || (i === 0 && reached >= 0 && status !== "cancelled");
          const current = i === reached;
          return (
            <li key={step.key} className={`relative flex items-start gap-4 ${!done && !current ? "opacity-75" : ""}`} aria-current={current ? "step" : undefined}>
              <div
                className={`absolute -left-6 md:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest ${
                  done ? "bg-primary text-on-primary" : "bg-surface-container-highest text-outline"
                }`}
              >
                {done ? <Icon name="check" className="!text-sm font-bold" /> : <Icon name={step.icon} className="!text-xs" />}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className={`font-title-md text-title-md ${done ? "text-primary font-bold" : "text-on-surface font-semibold"}`}>
                    {step.title}
                    <span className="sr-only">{done ? " (done)" : " (upcoming)"}</span>
                  </span>
                  {whenFor(i) && <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">{whenFor(i)}</span>}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
