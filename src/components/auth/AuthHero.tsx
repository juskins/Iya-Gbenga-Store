import Image from "next/image";
import Icon from "@/components/store/Icon";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA5ktVU8_U87MztMqSpFZZkC3JY-8Wozc2jej9TmlUXX4Fuv3BEu_7Qaowwgamk87V-0wlmbpm2dm1sQ8bH9IV8-2n0_ZWIDI-PiorTjnpeqamjmgrsvAQY7ZTzdO1aXvCNljqOglRTg-faKK9HajrbEXJVTvEVJPa2FVHVehA1cEge0DI1qhJDItLjO_O38F1kByD1wMIaTRThcpKSj8dcU48TZr6RJr_hSHQ5oaOVFs1h9QbkD_5CEg";

const BENEFITS = [
  { icon: "shopping_basket", tone: "bg-secondary-container text-on-secondary", title: "Your basket, anywhere", body: "Pick up where you left off on any device once you sign in." },
  { icon: "receipt_long", tone: "bg-tertiary-fixed text-on-tertiary-fixed", title: "Order history", body: "See your past orders and their status in one place." },
  { icon: "bolt", tone: "bg-surface-container-lowest text-primary", title: "Faster checkout", body: "Your details are ready the next time you order." },
];

export default function AuthHero() {
  return (
    <div className="lg:col-span-5 relative flex flex-col gap-space-md p-space-lg lg:p-space-xl bg-primary text-on-primary overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C30,40 70,20 100,60 L100,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="relative z-10 flex flex-col gap-space-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-wider uppercase self-start">
          <Icon name="eco" className="text-sm text-secondary-container" />
          <span>Authentic Nigerian groceries</span>
        </div>
        <p className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-on-primary tracking-tight font-bold">
          Better Market. <br />
          <span className="text-primary-fixed">Sweeter Soups.</span>
        </p>
        <p className="font-body-md text-body-md text-primary-fixed/80 max-w-sm">
          Handpicked yams, stone-free beans, pure palm oil and sundried peppers delivered to your doorstep in Lagos.
        </p>
        <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video bg-primary-container">
          <Image
            src={HERO_IMAGE}
            alt="Yam tubers, palm oil, dried crayfish and scotch bonnet peppers on a kitchen counter"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent flex items-end p-space-sm">
            <span className="font-label-caps text-label-caps text-on-primary flex items-center gap-1.5">
              <Icon name="verified" className="text-sm text-secondary-fixed" />
              Inspected for sand-free purity before bagging
            </span>
          </div>
        </div>
        <ul className="flex flex-col gap-space-xs pt-space-xs">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-center gap-space-sm p-space-sm rounded-lg bg-primary-container/60 backdrop-blur-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${b.tone}`}>
                <Icon name={b.icon} className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-primary font-bold">{b.title}</span>
                <span className="font-body-sm text-body-sm text-primary-fixed-dim">{b.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
