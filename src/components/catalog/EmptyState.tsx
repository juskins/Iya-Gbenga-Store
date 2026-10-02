import Link from "next/link";
import Icon from "@/components/store/Icon";
import { buildHref, type CatalogState } from "./query";

const SUGGESTIONS = ["Palm oil", "Garri", "Crayfish", "Stockfish", "Plantain"];

export default function EmptyState({ state }: { state: CatalogState }) {
  const reset = buildHref({ ...state, q: "", categories: [], minPrice: undefined, maxPrice: undefined, stock: [] });
  return (
    <div className="bg-surface-container-low rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary mb-4">
        <Icon name="shopping_basket" className="text-3xl" />
      </div>
      <div className="max-w-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          {state.q ? <>No groceries matched &ldquo;{state.q}&rdquo;</> : "No groceries matched your filters"}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
          Try a different search, widen your price range, or clear some filters.
        </p>
        <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="font-label-md text-label-md text-outline">Try searching for:</span>
          <ul className="flex items-center gap-1.5 flex-wrap justify-center">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link
                  href={buildHref({ ...state, categories: [], minPrice: undefined, maxPrice: undefined, stock: [] }, { q: s })}
                  className="inline-flex items-center min-h-11 text-xs bg-surface-container px-3 rounded-full text-primary font-semibold hover:bg-primary hover:text-on-primary transition-colors"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={reset} className="mt-5 inline-flex items-center justify-center min-h-11 bg-primary hover:bg-primary-container text-on-primary px-6 rounded-full font-label-md text-label-md font-semibold transition-all shadow-sm">
          Reset Filters
        </Link>
      </div>
    </div>
  );
}
