"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { categories } from "@/lib/data/categories";
import { IMG } from "@/lib/data/images";
import { formatNaira } from "@/lib/format";
import { FREE_DELIVERY_THRESHOLD_KOBO, SUPPORT_PHONE } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartCount, selectCartSubtotal } from "@/store/cartSlice";
import { setMobileNav } from "@/store/uiSlice";
import Icon from "@/components/store/Icon";

function SearchForm({ className = "" }: { className?: string }) {
  const params = useSearchParams();
  return (
    <form
      action="/groceries"
      role="search"
      className={`relative flex w-full items-center bg-surface-container-low rounded-full px-2 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <label className="sr-only" htmlFor="header-category">
        Category
      </label>
      <select
        id="header-category"
        name="category"
        defaultValue={params.get("category") ?? ""}
        className="hidden md:block bg-transparent font-label-md text-label-md text-on-surface-variant focus:outline-none cursor-pointer pr-4 pl-2 max-w-40"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="hidden md:block w-px h-5 bg-outline-variant" />
      <div className="flex items-center flex-1 px-3">
        <Icon name="search" className="text-outline text-xl mr-2" />
        <label className="sr-only" htmlFor="header-search">
          Search groceries
        </label>
        <input
          id="header-search"
          name="q"
          type="search"
          defaultValue={params.get("q") ?? ""}
          placeholder="Search yams, crayfish, palm oil..."
          className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2 min-h-9 rounded-full hover:bg-primary-container transition-colors"
      >
        Search
      </button>
    </form>
  );
}

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const mobileNavOpen = useAppSelector((s) => s.ui.mobileNavOpen);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const firstName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "").split(/[s@]/)[0];

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [{ slug: "", name: "All Groceries" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="bg-primary text-on-primary py-2 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-label-caps text-label-caps tracking-wider uppercase">
          <span className="truncate">
            🚚 Free delivery in Lagos on grocery orders above {formatNaira(FREE_DELIVERY_THRESHOLD_KOBO)}
          </span>
          <span className="hidden lg:inline whitespace-nowrap">📞 Support: {SUPPORT_PHONE}</span>
        </div>
      </div>

      <div className="h-20 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            onClick={() => dispatch(setMobileNav(true))}
            className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <Icon name="menu" className="text-2xl" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image src={IMG.logo} alt="" width={32} height={32} className="h-8 w-auto object-contain" priority />
            <span className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Iya Gbenga&apos;s</span>
              <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">
                Authentic Groceries
              </span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl mx-space-md">
          <Suspense fallback={<div className="w-full h-12 rounded-full bg-surface-container-low" />}>
            <SearchForm />
          </Suspense>
        </div>

        <div className="flex items-center gap-space-md">
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/account/orders"
                className="flex items-center gap-2 p-1.5 pr-3 min-h-11 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <Icon name="account_circle" className="text-3xl text-on-surface-variant" />
                <span className="hidden md:flex flex-col text-left">
                  <span className="font-label-caps text-label-caps text-outline uppercase">Welcome</span>
                  <span className="font-label-md text-label-md text-on-surface">Hello, {firstName}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="hidden md:block px-3 min-h-11 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 p-1.5 pr-3 min-h-11 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <Icon name="account_circle" className="text-3xl text-on-surface-variant" />
              <span className="hidden md:flex flex-col text-left">
                <span className="font-label-caps text-label-caps text-outline uppercase">Account</span>
                <span className="font-label-md text-label-md text-on-surface">Sign in</span>
              </span>
            </Link>
          )}
          <Link
            href="/cart"
            aria-label={`Cart, ${count} items, ${formatNaira(subtotal)}`}
            className="flex items-center gap-space-xs bg-primary text-on-primary px-4 py-2 min-h-11 rounded-full hover:bg-primary-container transition-all shadow-[0_2px_8px_-2px_rgba(22,78,51,0.2)]"
          >
            <Icon name="shopping_bag" className="text-xl" />
            <span className="flex flex-col text-left">
              <span className="font-label-caps text-[10px] uppercase text-primary-fixed">
                {count} {count === 1 ? "item" : "items"}
              </span>
              <span className="font-price-card text-label-md font-bold leading-none">{formatNaira(subtotal)}</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="md:hidden px-margin-mobile pb-3">
        <Suspense fallback={<div className="w-full h-12 rounded-full bg-surface-container-low" />}>
          <SearchForm />
        </Suspense>
      </div>

      <div className="hidden lg:block bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <nav aria-label="Categories" className="flex items-center gap-space-sm overflow-x-auto no-scrollbar py-2">
            {navLinks.map((l) => {
              const href = l.slug ? `/groceries?category=${l.slug}` : "/groceries";
              return (
                <Link
                  key={l.name}
                  href={href}
                  className="font-label-md text-label-md px-3 py-1.5 whitespace-nowrap transition-colors text-on-surface-variant hover:text-on-surface"
                >
                  {l.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-inverse-surface/50"
            onClick={() => dispatch(setMobileNav(false))}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-surface-container-lowest p-6 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-headline-sm text-headline-sm text-primary">Iya Gbenga&apos;s</span>
              <button
                aria-label="Close menu"
                onClick={() => dispatch(setMobileNav(false))}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-low"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            {navLinks.map((l) => (
              <Link
                key={l.name}
                href={l.slug ? `/groceries?category=${l.slug}` : "/groceries"}
                onClick={() => dispatch(setMobileNav(false))}
                className="px-3 py-3 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
              >
                {l.name}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="mt-4 px-3 py-3 rounded-xl text-left font-label-md text-label-md text-primary bg-primary-fixed/30"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => dispatch(setMobileNav(false))}
                className="mt-4 px-3 py-3 rounded-xl font-label-md text-label-md text-primary bg-primary-fixed/30"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
