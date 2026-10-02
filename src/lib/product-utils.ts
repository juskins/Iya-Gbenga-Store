import type { Product } from "@/lib/types";

export const startingPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceKobo));
