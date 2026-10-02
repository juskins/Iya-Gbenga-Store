import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/store/Icon";
import AuthHero from "@/components/auth/AuthHero";
import AuthForms from "@/components/auth/AuthForms";
import AuthAssurances from "@/components/auth/AuthAssurances";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create an account to check out and track your orders at Iya Gbenga's Store.",
};

/** Only allow same-site relative redirects (blocks open redirects like //evil.com). */
function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, mode, error } = await searchParams;
  const redirectTo = safeNext(next);

  return (
    <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-space-md lg:py-space-xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-md">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="home" className="text-base" />
          <span>Home</span>
        </Link>
        <Icon name="chevron_right" className="text-xs text-outline" />
        <span aria-current="page" className="text-secondary font-bold">
          Sign In / Register
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden bg-surface-container-lowest shadow-xl">
        <AuthHero />
        <div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-center bg-surface-container-lowest">
          <div className="max-w-xl mx-auto w-full flex flex-col">
            {error === "auth_failed" && (
              <div role="alert" className="mb-space-md flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
                <Icon name="error" className="text-lg shrink-0" />
                <span>Sign-in did not complete. Please try again.</span>
              </div>
            )}
            <AuthForms next={redirectTo} initialMode={mode === "signup" ? "signup" : "signin"} />
            <div className="mt-space-lg bg-surface-container-low/70 rounded-xl p-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-1.5 text-on-surface-variant font-label-caps text-label-caps uppercase">
                <Icon name="lock" className="text-sm text-primary" />
                <span>Secure sign-in</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant font-label-caps text-label-caps uppercase">
                <Icon name="shield_person" className="text-sm text-primary" />
                <span>We never post on your behalf</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthAssurances />
    </div>
  );
}
