import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/store/Icon";
import Stars from "@/components/store/Stars";
import BestOfMarket from "@/components/home/BestOfMarket";
import NewsletterBanner from "@/components/home/NewsletterBanner";
import { categories } from "@/lib/data/categories";
import { getAllProducts } from "@/lib/data/catalog";
import { IMG } from "@/lib/data/images";
import { FREE_DELIVERY_THRESHOLD_KOBO } from "@/lib/config";
import { formatNaira } from "@/lib/format";
import type { Category } from "@/lib/types";

const tileTones: Record<NonNullable<Category["tileBadge"]>["tone"], string> = {
  secondary: "bg-secondary text-on-secondary",
  primary: "bg-primary text-on-primary",
  tertiary: "bg-tertiary text-on-tertiary",
  orange: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
  mint: "bg-primary-fixed text-on-primary-fixed",
};

const trust = [
  { icon: "bolt", tone: "text-secondary", title: "Fast Delivery", text: "Delivered to your doorstep" },
  { icon: "shield", tone: "text-primary", title: "Quality Checked", text: "Inspected before pack-out" },
  { icon: "agriculture", tone: "text-tertiary", title: "Market-Direct Sourcing", text: "Staples from trusted suppliers" },
  {
    icon: "local_shipping",
    tone: "text-secondary",
    title: "Free Delivery",
    text: `On orders above ${formatNaira(FREE_DELIVERY_THRESHOLD_KOBO)}`,
  },
];

const features = [
  {
    icon: "task_alt",
    iconBg: "bg-secondary-container text-on-secondary-container",
    step: "Step 01 / Inspection",
    title: "Handpicked Sorting",
    text: "Tubers, grains and dried goods are checked by hand to weed out spoiled or damaged items before packaging.",
    note: "Checked before every pack-out",
    noteIcon: "text-secondary-container",
  },
  {
    icon: "sanitizer",
    iconBg: "bg-primary-fixed text-on-primary-fixed",
    step: "Step 02 / Packaging",
    title: "Sealed Preservation",
    text: "Smoked proteins and spices are sealed in clean culinary pouches so they arrive fragrant and kitchen-ready.",
    note: "Packed to stay fresh in transit",
    noteIcon: "text-primary-fixed",
  },
  {
    icon: "two_wheeler",
    iconBg: "bg-secondary text-on-secondary",
    step: "Step 03 / Dispatch",
    title: "Careful Dispatch",
    text: "Fresh herbs and produce are packed with care and dispatched promptly so they reach you in good condition.",
    note: "Delivery updates via WhatsApp",
    noteIcon: "text-secondary-container",
  },
];

const testimonials = [
  {
    initials: "OA",
    bg: "bg-surface-container-high text-primary",
    name: "Dr. Omotola A.",
    place: "Lekki Phase 1, Lagos",
    text: "The smoked mangala catfish was clean and the aroma filled my house. Much less washing than I usually do with fish from the open market.",
  },
  {
    initials: "EE",
    bg: "bg-primary-fixed text-on-primary-fixed",
    name: "Emeka E.",
    place: "Garki 2, Abuja",
    text: "Finding authentic sour and crisp Ijebu garri was hard until Iya Gbenga's Store. It drinks so well with ice and roasted groundnuts.",
  },
  {
    initials: "BO",
    bg: "bg-secondary-fixed text-on-secondary-fixed",
    name: "Mrs. Bukola O.",
    place: "GRA Ikeja, Lagos",
    text: "I ordered the Egusi Soup Bundle for Sunday family lunch. Everything arrived fresh and cooking was so much easier with it all in one box.",
  },
  {
    initials: "FA",
    bg: "bg-surface-container-highest text-primary",
    name: "Folake Adeyemi",
    place: "Bodija, Ibadan",
    text: "The white yams pounded smooth and I saw no rot spots. Reliable quality, just like shopping at the market myself.",
  },
];

export default async function Home() {
  const featured = (await getAllProducts()).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-surface-container-low py-12 lg:py-20 px-margin-mobile md:px-margin-desktop">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/4 -bottom-20 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"
        />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container w-fit shadow-sm">
              <Icon name="eco" filled className="text-sm text-secondary-container" />
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-primary">
                Handpicked Market Freshness
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-primary tracking-tight">
              Authentic Nigerian Groceries, Straight From the Market to Your Kitchen.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Yams, palm oil, ripe plantains, Ijebu garri, and smoked fish. Cleaned, sorted, and delivered to your
              doorstep.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-2">
              <Link
                href="/groceries"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-8 py-4 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all active:scale-95 shadow-md"
              >
                <span>Shop Groceries Now</span>
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
              <Link
                href="/groceries?category=soup-bundles"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 py-4 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm"
              >
                <Icon name="soup_kitchen" className="text-secondary" />
                <span>Explore Soup Bundles</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden shadow-xl bg-surface-container-lowest">
              <Image
                src={IMG.hero}
                alt="Nigerian ingredients on a wooden table: yams, ripe plantains, palm oil, garri, smoked fish and peppers"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 sm:p-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <Icon name="verified" className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold text-on-surface">Direct Market Run</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Packed with care</p>
                  </div>
                </div>
                <span className="hidden min-[420px]:inline font-label-caps text-label-caps px-3 py-1 rounded-full bg-tertiary text-on-tertiary font-semibold uppercase whitespace-nowrap">
                  Fresh Batch
                </span>
              </div>
            </div>
            <div className="hidden xl:flex absolute -left-8 top-12 p-3 rounded-xl bg-surface-container-lowest shadow-lg items-center gap-3 max-w-xs">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <Icon name="local_shipping" className="text-base" />
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">Doorstep Delivery</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Carefully packed for transit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="max-w-7xl mx-auto mt-12 bg-surface-container-lowest rounded-2xl shadow-sm px-6 py-5 relative z-10">
          <ul className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {trust.map((t) => (
              <li key={t.title} className="flex items-center gap-3">
                <Icon name={t.icon} className={`text-3xl ${t.tone}`} />
                <div>
                  <h2 className="font-label-md text-label-md font-bold text-on-surface">{t.title}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Shop by category */}
      <section className="w-full py-16 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
                Aisle Catalog
              </span>
              <h2 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary">
                Shop by Fresh Category
              </h2>
            </div>
            <Link
              href="/groceries"
              className="inline-flex items-center gap-1 min-h-11 font-label-md text-label-md text-primary font-bold hover:text-primary-container transition-colors"
            >
              <span>View All Categories</span>
              <Icon name="chevron_right" className="text-lg" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/groceries?category=${c.slug}`}
                className="group flex flex-col items-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-center relative overflow-hidden"
              >
                {c.tileBadge && (
                  <span
                    className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full font-label-caps text-[9px] uppercase ${tileTones[c.tileBadge.tone]}`}
                  >
                    {c.tileBadge.text}
                  </span>
                )}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-low my-2 overflow-hidden group-hover:scale-105 transition-transform">
                  {c.image && <Image src={c.image} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                  {c.tileLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BestOfMarket products={featured} />

      {/* Why us */}
      <section className="w-full py-20 px-margin-mobile md:px-margin-desktop bg-primary text-on-primary">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="font-label-caps text-label-caps uppercase text-secondary-container font-bold tracking-widest">
                Our Quality Standard
              </span>
              <h2 className="font-display-hero text-headline-lg md:text-headline-xl text-on-primary mt-2">
                Market Shopping Without the Stress
              </h2>
            </div>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-md">
              Open market shopping can be strenuous and unpredictable. We take care of the sorting and checking so you
              get quality groceries at home.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f) => (
              <div
                key={f.step}
                className="flex flex-col p-6 sm:p-8 rounded-2xl bg-primary-container text-on-primary shadow-lg relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.iconBg}`}>
                  <Icon name={f.icon} className="text-3xl" />
                </div>
                <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider mb-2">
                  {f.step}
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold mb-3">{f.title}</h3>
                <p className="font-body-md text-body-md text-on-primary-container">{f.text}</p>
                <div className="mt-auto pt-0 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
                  <div className="mt-6 bg-primary/40 p-6 flex items-center gap-2">
                    <Icon name="done_all" className={f.noteIcon} />
                    <span className="font-label-md text-label-md font-semibold">{f.note}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
              Kitchen Diaries
            </span>
            <h2 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary">Loved Across Nigeria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col p-6 rounded-2xl bg-surface-container-lowest shadow-sm">
                <div className="mb-3">
                  <Stars rating={5} />
                </div>
                <blockquote className="font-body-md text-body-md text-on-surface mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${t.bg}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold text-on-surface">{t.name}</p>
                    <p className="font-body-sm text-body-sm text-outline">{t.place}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBanner />
    </>
  );
}
