import type { Product } from "@/lib/types";

type Tone = NonNullable<Product["badge"]>["tone"];

const tones: Record<Tone, string> = {
  secondary: "bg-secondary text-on-secondary",
  primary: "bg-primary-container text-on-primary-container",
  tertiary: "bg-tertiary text-on-tertiary",
  orange: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
  mint: "bg-primary-fixed text-on-primary-fixed",
};

export default function Badge({ text, tone, className = "" }: { text: string; tone: Tone; className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full font-label-caps text-label-caps font-bold ${tones[tone]} ${className}`}>
      {text}
    </span>
  );
}
