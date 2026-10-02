import Link from "next/link";
import Icon from "@/components/store/Icon";

export default function EmptyCart() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary mb-space-md">
          <Icon name="shopping_basket" className="text-4xl" />
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">Your grocery basket is empty</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
          Fresh yams, aromatic palm oil and sand-free dried seafood are waiting for you. Add something to get started.
        </p>
        <Link
          href="/groceries"
          className="inline-flex items-center justify-center min-h-11 bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-full hover:bg-primary-container transition-all shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
