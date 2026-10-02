import type { Category } from "@/lib/types";
import { IMG } from "./images";

export const categories: Category[] = [
  { slug: "tubers-staples", name: "Fresh Yams & Plantains", tileLabel: "Fresh Tubers & Plantains", tileBadge: { text: "Bestseller", tone: "secondary" }, image: IMG.catTubers },
  { slug: "oils-seasonings", name: "Palm Oil & Spices", tileLabel: "Palm Oil & Seasonings", image: IMG.catOils },
  { slug: "grains-flour", name: "Garri, Rice & Beans", tileLabel: "Ijebu Garri & Grains", image: IMG.catGrains },
  { slug: "dried-seafood", name: "Dried Fish & Crayfish", tileLabel: "Smoked Fish & Crayfish", image: IMG.catSeafood },
  { slug: "soup-bundles", name: "Soup Bundles", tileLabel: "Soup Bundles", image: IMG.catBundles },
  { slug: "peppers-herbs", name: "Fresh Peppers & Herbs", tileLabel: "Fresh Peppers & Herbs", image: IMG.catPeppers },
  { slug: "snacks", name: "Snacks & Chin Chin", tileLabel: "Snacks & Chin Chin", image: IMG.catSnacks },
];
