import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/store/Icon";
import ProductCard from "@/components/store/ProductCard";
import { getAllProducts } from "@/lib/data/catalog";
import { categories } from "@/lib/data/categories";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import EmptyState from "@/components/catalog/EmptyState";
import FilterPanel from "@/components/catalog/FilterPanel";
import FilterSheet from "@/components/catalog/FilterSheet";
import Pagination from "@/components/catalog/Pagination";
import { activeFilterCount, buildHref, filterProducts, parseState, sortProducts } from "@/components/catalog/query";

export const metadata: Metadata = {
  title: "Groceries",
  description: "Shop authentic Nigerian staples: yams, palm oil, garri, dried fish, crayfish, peppers, spices and soup bundles.",
};

export default async function GroceriesPage({ searchParams }: PageProps<"/groceries">) {
  const state = parseState(await searchParams);
  const products = await getAllProducts();

  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const results = sortProducts(filterProducts(products, state, names), state.sort);
  const total = results.length;
  const pageCount = Math.max(1, Math.ceil(total / state.limit));
  const page = Math.min(state.page, pageCount);
  const visible = results.slice((page - 1) * state.limit, page * state.limit);

  const options = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: products.filter((p) => p.categorySlug === c.slug).length,
  }));
  const filterCount = activeFilterCount(state);
  const singleCategory = state.categories.length === 1 ? names[state.categories[0]] : undefined;

  return (
    <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-4 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="home" className="text-base" />
          Home
        </Link>
        <Icon name="chevron_right" className="text-outline-variant text-sm" />
        {singleCategory ? (
          <>
            <Link href="/groceries" className="hover:text-primary transition-colors">Groceries</Link>
            <Icon name="chevron_right" className="text-outline-variant text-sm" />
            <span aria-current="page" className="text-primary font-bold">{singleCategory}</span>
          </>
        ) : (
          <span aria-current="page" className="text-primary font-bold">Groceries</span>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
            Authentic Nigerian Groceries
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1" aria-live="polite">
            Showing <span className="font-semibold text-on-surface">{total} {total === 1 ? "item" : "items"}</span> from our market shelves.
          </p>
        </div>
        {state.q && (
          <div className="flex items-center gap-1.5 bg-surface-container-low pl-3 pr-1 rounded-full shadow-sm self-start lg:self-auto max-w-full">
            <Icon name="filter_list" className="text-secondary text-base" />
            <span className="font-label-md text-label-md text-on-surface-variant">Search:</span>
            <span className="font-label-md text-label-md text-primary font-semibold truncate">{state.q}</span>
            <Link href={buildHref(state, { q: "" })} aria-label="Clear search" className="w-11 h-11 flex items-center justify-center text-outline hover:text-error transition-colors">
              <Icon name="cancel" className="text-base" />
            </Link>
          </div>
        )}
      </div>

      <CatalogToolbar state={state} filterCount={filterCount} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside aria-label="Filters" className="hidden lg:block lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <FilterPanel state={state} categories={options} idPrefix="side" />
        </aside>

        <section aria-label="Products" className="lg:col-span-9">
          {visible.length === 0 ? (
            <EmptyState state={state} />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {visible.map((p, i) => (
                <li key={p.slug} className="flex *:w-full">
                  <ProductCard product={p} priority={i < 3} />
                </li>
              ))}
            </ul>
          )}
          {total > 0 && <Pagination state={state} total={total} page={page} pageCount={pageCount} />}
        </section>
      </div>

      <FilterSheet state={state} categories={options} resultCount={total} />
    </div>
  );
}
