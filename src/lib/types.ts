export type Category = {
  slug: string;
  name: string;
  /** Short label used on the home category tiles. */
  tileLabel: string;
  tileBadge?: { text: string; tone: "secondary" | "primary" | "tertiary" | "orange" | "error" | "mint" };
  image?: string;
};

export type Variant = {
  id: string;
  label: string;
  sku: string;
  priceKobo: number;
  compareAtPriceKobo?: number;
  stockQty: number;
  maxPerOrder: number;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryLabel: string;
  origin: string;
  badge?: { text: string; tone: "secondary" | "primary" | "tertiary" | "orange" | "error" | "mint" };
  description: string;
  images: string[];
  /** Not stored yet (reviews are P1). UI hides ratings when absent. */
  rating?: number;
  reviewCount?: number;
  variants: Variant[];
  relatedSlugs: string[];
  createdAt: string;
};

export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  variantLabel: string;
  image: string;
  unitPriceKobo: number;
  quantity: number;
  maxPerOrder: number;
};
