import type { Product, Variant } from "@/lib/types";
import { IMG } from "./images";

const naira = (n: number) => n * 100;

function variant(
  id: string,
  label: string,
  price: number,
  opts: Partial<Omit<Variant, "id" | "label" | "priceKobo">> & { compareAt?: number } = {},
): Variant {
  return {
    id,
    label,
    sku: opts.sku ?? id.toUpperCase(),
    priceKobo: naira(price),
    compareAtPriceKobo: opts.compareAt ? naira(opts.compareAt) : undefined,
    stockQty: opts.stockQty ?? 50,
    maxPerOrder: opts.maxPerOrder ?? 10,
  };
}

// Mock catalog. Replaced by Supabase queries once the backend is wired.
export const products: Product[] = [
  {
    slug: "premium-abuja-white-yam-tuber",
    name: "Premium Abuja White Yam Tuber (Large, 4-5kg)",
    categorySlug: "tubers-staples",
    categoryLabel: "Tubers & Staples",
    origin: "Abuja, Nigeria",
    badge: { text: "Sale", tone: "error" },
    description:
      "Large, unblemished Abuja white yam, dry and starchy, ideal for pounded yam, boiled yam and yam porridge. Checked tuber by tuber before pack-out.",
    images: [IMG.yam],
    rating: 4.5,
    reviewCount: 128,
    variants: [variant("yam-4-5kg", "Large (4-5kg)", 4500, { compareAt: 5500, sku: "YAM-L" })],
    relatedSlugs: ["fresh-sweet-ripe-plantain-bunch", "original-nsukka-palm-oil", "oron-crayfish-cleaned-blended"],
    createdAt: "2026-09-01",
  },
  {
    slug: "original-nsukka-palm-oil",
    name: "Original Unadulterated Nsukka Palm Oil (5 Litres Keg)",
    categorySlug: "oils-seasonings",
    categoryLabel: "Oils & Seasonings",
    origin: "Nsukka, Enugu",
    badge: { text: "Best Seller", tone: "secondary" },
    description:
      "Pure, unadulterated red palm oil from Nsukka. Rich colour and aroma for stews, soups and ofada sauce.",
    images: [IMG.palmOil],
    rating: 5,
    reviewCount: 452,
    variants: [
      variant("palm-1l", "1 Litre Bottle", 3200, { sku: "PO-1L" }),
      variant("palm-2-5l", "2.5 Litres", 7600, { sku: "PO-2.5L" }),
      variant("palm-5l", "5 Litres Keg", 14800, { sku: "PO-5L" }),
    ],
    relatedSlugs: ["oron-crayfish-cleaned-blended", "special-ijebu-garri", "all-in-one-egusi-soup-bundle"],
    createdAt: "2026-08-20",
  },
  {
    slug: "special-ijebu-garri",
    name: "Special Ijebu Garri (Crisp & Sour, 5kg Paint Bucket)",
    categorySlug: "grains-flour",
    categoryLabel: "Grains & Flour",
    origin: "Ijebu, Ogun",
    badge: { text: "Popular", tone: "tertiary" },
    description: "Crisp, lightly sour Ijebu garri that soaks well and swells beautifully for eba.",
    images: [IMG.garri],
    rating: 5,
    reviewCount: 310,
    variants: [variant("garri-5kg", "5kg Paint Bucket", 6200, { sku: "GARRI-5" })],
    relatedSlugs: ["original-nsukka-palm-oil", "opa-smoked-mangala-catfish", "oron-crayfish-cleaned-blended"],
    createdAt: "2026-08-10",
  },
  {
    slug: "oron-crayfish-cleaned-blended",
    name: "Oron Crayfish (Cleaned & Blended, 1kg Sealed Jar)",
    categorySlug: "dried-seafood",
    categoryLabel: "Dried Seafood",
    origin: "Oron, Akwa Ibom",
    badge: { text: "Sand-Free", tone: "primary" },
    description: "Hand-cleaned Oron crayfish, finely blended and sealed in an airtight jar.",
    images: [IMG.crayfish],
    rating: 5,
    reviewCount: 94,
    variants: [variant("crayfish-1kg", "1kg Sealed Jar", 8500, { sku: "CRAY-1" })],
    relatedSlugs: ["opa-smoked-mangala-catfish", "all-in-one-egusi-soup-bundle", "original-nsukka-palm-oil"],
    createdAt: "2026-08-05",
  },
  {
    slug: "kilishi-supreme",
    name: "Kilishi Supreme (Spicy Beef Jerky from Kano, 250g)",
    categorySlug: "snacks",
    categoryLabel: "Meat & Snacks",
    origin: "Kano, Nigeria",
    description: "Thin-sliced, spiced and sun-dried Kano kilishi with a proper yaji kick.",
    images: [IMG.kilishi],
    rating: 5,
    reviewCount: 88,
    variants: [variant("kilishi-250g", "250g Pack", 3800, { sku: "KIL-250" })],
    relatedSlugs: ["fresh-sweet-ripe-plantain-bunch", "special-ijebu-garri", "oron-crayfish-cleaned-blended"],
    createdAt: "2026-07-28",
  },
  {
    slug: "fresh-sweet-ripe-plantain-bunch",
    name: "Fresh Sweet Ripe Plantain Bunch (5 Large Fingers)",
    categorySlug: "tubers-staples",
    categoryLabel: "Tubers & Produce",
    origin: "Ogun, Nigeria",
    badge: { text: "Fresh Harvest", tone: "tertiary" },
    description: "A heavy bunch of sweet, ripe cooking plantains with clean skins, ready for frying.",
    images: [IMG.plantain],
    rating: 4.5,
    reviewCount: 215,
    variants: [variant("plantain-5", "5 Large Fingers", 2600, { sku: "PLAN-5" })],
    relatedSlugs: ["premium-abuja-white-yam-tuber", "original-nsukka-palm-oil", "kilishi-supreme"],
    createdAt: "2026-09-10",
  },
  {
    slug: "opa-smoked-mangala-catfish",
    name: "Opa Smoked Mangala Catfish (Pre-washed, 4 Whole Fish)",
    categorySlug: "dried-seafood",
    categoryLabel: "Dried Seafood & Meat",
    origin: "Lagos, Nigeria",
    description: "Wood-smoked whole mangala catfish, pre-washed and cured to a deep mahogany colour.",
    images: [IMG.catfish],
    rating: 5,
    reviewCount: 176,
    variants: [variant("catfish-4", "4 Whole Fish", 9500, { sku: "CAT-4" })],
    relatedSlugs: ["oron-crayfish-cleaned-blended", "all-in-one-egusi-soup-bundle", "original-nsukka-palm-oil"],
    createdAt: "2026-07-15",
  },
  {
    slug: "all-in-one-egusi-soup-bundle",
    name: "All-In-One Egusi Soup Bundle (Egusi, Stockfish, Crayfish, Ugu Leaves)",
    categorySlug: "soup-bundles",
    categoryLabel: "Complete Bundles",
    origin: "Various",
    badge: { text: "Bundle Deal", tone: "orange" },
    description: "Everything for a pot of egusi soup: shelled egusi, stockfish, crayfish and fresh ugu leaves.",
    images: [IMG.soupBundle],
    rating: 5,
    reviewCount: 62,
    variants: [variant("egusi-bundle", "Family Bundle", 16000, { sku: "BND-EGUSI" })],
    relatedSlugs: ["oron-crayfish-cleaned-blended", "original-nsukka-palm-oil", "opa-smoked-mangala-catfish"],
    createdAt: "2026-09-20",
  },
];

// Additional catalogue lines so filtering, sorting and pagination are demonstrable.
type Extra = {
  slug: string; name: string; cat: string; label: string; origin: string; desc: string; img: string;
  price: number; vLabel: string; sku: string; rating: number; reviews: number; created: string;
  badge?: Product["badge"]; stock?: number; compareAt?: number; related?: string[];
};

const extra = (e: Extra): Product => ({
  slug: e.slug,
  name: e.name,
  categorySlug: e.cat,
  categoryLabel: e.label,
  origin: e.origin,
  badge: e.badge,
  description: e.desc,
  images: [e.img],
  rating: e.rating,
  reviewCount: e.reviews,
  variants: [variant(e.sku.toLowerCase(), e.vLabel, e.price, { sku: e.sku, stockQty: e.stock, compareAt: e.compareAt })],
  relatedSlugs: e.related ?? ["original-nsukka-palm-oil", "special-ijebu-garri", "oron-crayfish-cleaned-blended"],
  createdAt: e.created,
});

products.push(
  extra({ slug: "oloyin-honey-beans-10kg", name: "Original Oloyin Honey Beans (Stone-Free, 10kg Bag)", cat: "grains-flour", label: "Grains & Flour", origin: "Osun State", desc: "Sweet, small-grained oloyin beans, hand-picked and stone-free. Cooks soft for ewa agoyin and moin moin.", img: IMG.garri, price: 18500, vLabel: "10kg Bag", sku: "BEAN-10", rating: 4.5, reviews: 310, created: "2026-06-12", stock: 0 }),
  extra({ slug: "local-ofada-rice-5kg", name: "Local Ofada Rice (Unpolished, 5kg)", cat: "grains-flour", label: "Grains & Flour", origin: "Ogun State", desc: "Aromatic unpolished ofada rice with the traditional earthy flavour, destoned and ready to wash and cook.", img: IMG.garri, price: 11500, vLabel: "5kg Bag", sku: "OFADA-5", rating: 4.5, reviews: 143, created: "2026-09-05", badge: { text: "New", tone: "primary" } }),
  extra({ slug: "yellow-garri-5kg", name: "Yellow Garri (Palm-Oil Fried, 5kg)", cat: "grains-flour", label: "Grains & Flour", origin: "Edo State", desc: "Golden yellow garri with a nutty flavour, good for eba and for soaking.", img: IMG.garri, price: 5800, vLabel: "5kg Bag", sku: "YGARRI-5", rating: 4, reviews: 97, created: "2026-08-02" }),
  extra({ slug: "poundo-yam-flour-2kg", name: "Poundo Yam Flour (Smooth, 2kg)", cat: "grains-flour", label: "Grains & Flour", origin: "Abuja, Nigeria", desc: "Fine, smooth yam flour for quick pounded yam without the pounding.", img: IMG.yam, price: 4200, vLabel: "2kg Pack", sku: "POUNDO-2", rating: 4.5, reviews: 121, created: "2026-07-02", compareAt: 4800, badge: { text: "Sale", tone: "error" } }),
  extra({ slug: "cameroon-pepper-powder-250g", name: "Cameroon Pepper Powder (Smoky Hot, 250g Jar)", cat: "oils-seasonings", label: "Oils & Seasonings", origin: "Cross River", desc: "Smoky, hot ground Cameroon pepper in a sealed glass jar. A little goes a long way in soups and suya spice.", img: IMG.palmOil, price: 2200, vLabel: "250g Jar", sku: "CPEP-250", rating: 4.5, reviews: 88, created: "2026-08-25", badge: { text: "Hot & Smoky", tone: "orange" } }),
  extra({ slug: "iru-locust-beans-200g", name: "Iru Woro Locust Beans (Fermented, 200g)", cat: "oils-seasonings", label: "Oils & Seasonings", origin: "Oyo State", desc: "Traditional fermented locust beans, a deep savoury base for efo riro, ogbono and ewedu.", img: IMG.palmOil, price: 1200, vLabel: "200g Pack", sku: "IRU-200", rating: 4.5, reviews: 54, created: "2026-07-18" }),
  extra({ slug: "ground-ogbono-500g", name: "Ground Ogbono Seeds (Draw-Soup Grade, 500g)", cat: "oils-seasonings", label: "Oils & Seasonings", origin: "Edo State", desc: "Freshly ground ogbono with a strong draw, ready for your soup pot.", img: IMG.palmOil, price: 3500, vLabel: "500g Pack", sku: "OGB-500", rating: 4.5, reviews: 76, created: "2026-09-14", stock: 6 }),
  extra({ slug: "groundnut-oil-3-litres", name: "Pure Groundnut Oil (3 Litres)", cat: "oils-seasonings", label: "Oils & Seasonings", origin: "Kano, Nigeria", desc: "Cold-filtered groundnut oil for frying and suya, light and neutral in flavour.", img: IMG.palmOil, price: 9800, vLabel: "3 Litres", sku: "GNO-3L", rating: 4, reviews: 41, created: "2026-05-30" }),
  extra({ slug: "fresh-rodo-tatashe-mix", name: "Fresh Rodo & Tatashe Mix (Large Basket)", cat: "peppers-herbs", label: "Peppers & Herbs", origin: "Kano & Jos", desc: "Scotch bonnet (rodo) and red bell pepper (tatashe) in the right ratio for stew base. Sorted and packed fresh.", img: IMG.catPeppers, price: 4200, vLabel: "Large Basket", sku: "PEP-MIX", rating: 4.5, reviews: 108, created: "2026-09-22", badge: { text: "Daily Fresh", tone: "tertiary" } }),
  extra({ slug: "fresh-ugu-leaves-bunch", name: "Fresh Ugu (Pumpkin) Leaves (Large Bunch)", cat: "peppers-herbs", label: "Peppers & Herbs", origin: "Ogun State", desc: "A generous bunch of tender ugu leaves for egusi, edikaikong and efo.", img: IMG.catPeppers, price: 1200, vLabel: "Large Bunch", sku: "UGU-1", rating: 4.5, reviews: 63, created: "2026-09-24" }),
  extra({ slug: "fresh-bitterleaf-washed", name: "Fresh Bitterleaf (Washed & Squeezed, 400g)", cat: "peppers-herbs", label: "Peppers & Herbs", origin: "Ogun State", desc: "Washed and squeezed bitterleaf, ready for a pot of ofe onugbu.", img: IMG.catPeppers, price: 1500, vLabel: "400g Pack", sku: "BITTER-400", rating: 4, reviews: 39, created: "2026-09-18" }),
  extra({ slug: "scent-leaf-bunch", name: "Fresh Scent Leaf (Efirin, Large Bunch)", cat: "peppers-herbs", label: "Peppers & Herbs", origin: "Lagos, Nigeria", desc: "Fragrant scent leaf for pepper soup, stews and teas.", img: IMG.catPeppers, price: 800, vLabel: "Large Bunch", sku: "SCENT-1", rating: 4.5, reviews: 28, created: "2026-09-26", stock: 0 }),
  extra({ slug: "sweet-potato-5kg", name: "Orange-Fleshed Sweet Potatoes (5kg)", cat: "tubers-staples", label: "Tubers & Produce", origin: "Kwara State", desc: "Sweet, firm sweet potatoes for boiling, roasting or frying.", img: IMG.yam, price: 3800, vLabel: "5kg Bag", sku: "SPOT-5", rating: 4, reviews: 52, created: "2026-08-14" }),
  extra({ slug: "white-cocoyam-3kg", name: "White Cocoyam (Medium Corms, 3kg)", cat: "tubers-staples", label: "Tubers & Produce", origin: "Enugu State", desc: "Medium cocoyam corms that cook down to thicken ofe-based soups.", img: IMG.yam, price: 3200, vLabel: "3kg Bag", sku: "COCO-3", rating: 4, reviews: 33, created: "2026-07-08" }),
  extra({ slug: "firm-unripe-plantain-bunch", name: "Firm Unripe Plantain Bunch (6 Fingers)", cat: "tubers-staples", label: "Tubers & Produce", origin: "Ogun State", desc: "Green, firm plantains for boiling, porridge and chips.", img: IMG.plantain, price: 2400, vLabel: "6 Fingers", sku: "UPLAN-6", rating: 4.5, reviews: 70, created: "2026-09-12" }),
  extra({ slug: "stockfish-okporoko-500g", name: "Norwegian Stockfish (Okporoko, Medium Pieces, 500g)", cat: "dried-seafood", label: "Dried Seafood", origin: "Imported, cleaned in Lagos", desc: "Dry, clean stockfish pieces for egusi, ogbono and edikaikong. Soak overnight before cooking.", img: IMG.catfish, price: 12500, vLabel: "500g Pack", sku: "STOCK-500", rating: 4.5, reviews: 118, created: "2026-06-20" }),
  extra({ slug: "dried-bonga-fish-500g", name: "Smoked Bonga Fish (Shawa, 500g)", cat: "dried-seafood", label: "Dried Seafood", origin: "Lagos, Nigeria", desc: "Smoked bonga fish with a clean smoky aroma for soups and stews.", img: IMG.catfish, price: 5400, vLabel: "500g Pack", sku: "BONGA-500", rating: 4.5, reviews: 46, created: "2026-08-30", badge: { text: "Smoked Clean", tone: "primary" } }),
  extra({ slug: "crunchy-chin-chin-500g", name: "Crunchy Chin Chin (Sweet, 500g Tub)", cat: "snacks", label: "Snacks & Chin Chin", origin: "Lagos, Nigeria", desc: "Golden, crunchy chin chin made in small batches. Sealed tub.", img: IMG.kilishi, price: 2800, vLabel: "500g Tub", sku: "CHIN-500", rating: 4.5, reviews: 92, created: "2026-09-08" }),
  extra({ slug: "plantain-chips-200g", name: "Lightly Salted Plantain Chips (200g)", cat: "snacks", label: "Snacks & Chin Chin", origin: "Ogun State", desc: "Thin, crisp plantain chips fried in vegetable oil and lightly salted.", img: IMG.plantain, price: 1500, vLabel: "200g Pack", sku: "PCHIP-200", rating: 4, reviews: 57, created: "2026-08-18" }),
  extra({ slug: "ogbono-soup-bundle", name: "Ogbono Soup Bundle (Ogbono, Stockfish, Crayfish, Palm Oil)", cat: "soup-bundles", label: "Complete Bundles", origin: "Various", desc: "Ogbono, stockfish, crayfish and palm oil measured for one family pot.", img: IMG.soupBundle, price: 14500, vLabel: "Family Bundle", sku: "BND-OGBONO", rating: 4.5, reviews: 35, created: "2026-09-27", badge: { text: "Bundle Deal", tone: "orange" } }),
  extra({ slug: "efo-riro-soup-bundle", name: "Efo Riro Soup Bundle (Spinach, Peppers, Iru, Dried Fish)", cat: "soup-bundles", label: "Complete Bundles", origin: "Various", desc: "Fresh efo, rodo and tatashe, iru and smoked fish for a pot of efo riro.", img: IMG.soupBundle, price: 9800, vLabel: "Family Bundle", sku: "BND-EFO", rating: 4.5, reviews: 21, created: "2026-09-29" }),
);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const getVariant = (variantId: string) => {
  for (const p of products) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return undefined;
};

export const startingPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceKobo));
