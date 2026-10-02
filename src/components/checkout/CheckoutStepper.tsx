import Icon from "@/components/store/Icon";

const STEPS = ["Delivery", "Shipping", "Review & Place"];

/** current: 1-based step the customer is on. Steps before it show as done. */
export default function CheckoutStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2 md:gap-3" aria-current={active ? "step" : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-label-caps text-[11px] shadow-sm ${
                  done
                    ? "bg-primary text-on-primary"
                    : active
                      ? "bg-secondary-container text-on-secondary-container font-bold"
                      : "bg-surface-container-high text-on-surface-variant font-semibold"
                }`}
              >
                {done ? <Icon name="check" className="!text-sm font-bold" /> : n}
              </span>
              <span
                className={`font-label-md text-label-md whitespace-nowrap ${
                  done ? "text-primary font-semibold" : active ? "text-on-surface font-bold" : "text-on-surface-variant"
                }`}
              >
                {label}
                <span className="sr-only">{done ? " (completed)" : active ? " (current step)" : ""}</span>
              </span>
            </span>
            {n < STEPS.length && (
              <span aria-hidden="true" className={`w-6 md:w-10 h-0.5 rounded-full ${done ? "bg-primary" : "bg-surface-container-high"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
