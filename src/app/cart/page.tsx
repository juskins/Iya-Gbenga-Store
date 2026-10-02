import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { getAllProducts } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your groceries, add a note for our team and proceed to checkout.",
};

export default async function CartPage() {
  const products = await getAllProducts();
  return <CartView products={products} />;
}
