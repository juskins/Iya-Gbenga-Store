"use client";

import { useState } from "react";
import Icon from "@/components/store/Icon";
import { WHATSAPP_NUMBER } from "@/lib/config";

const WA_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Iya Gbenga's Store, I'd like to place an order.")}`;

export default function NewsletterBanner() {
  const [done, setDone] = useState(false);

  return (
    <section className="w-full py-16 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-7xl mx-auto rounded-3xl bg-surface-container-lowest shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed w-fit">
              <Icon name="notifications_active" className="text-sm" />
              <span className="font-label-caps text-label-caps uppercase font-bold">Market Updates</span>
            </div>
            <h2 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary font-bold">
              Join the Market Insider Club
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Get fresh harvest announcements and weekly market updates sent directly to your email or WhatsApp.
            </p>
            {done ? (
              <div
                role="status"
                className="mt-4 p-3 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-md text-label-md flex items-center gap-2"
              >
                <Icon name="check_circle" className="text-lg" />
                <span>Thanks for subscribing! We&apos;ll be in touch with market updates.</span>
              </div>
            ) : (
              <form
                className="flex flex-col sm:flex-row items-stretch gap-3 mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
              >
                <div className="flex-1 relative">
                  <Icon name="mail" className="text-outline absolute left-4 top-1/2 -translate-y-1/2" />
                  <label htmlFor="insider-contact" className="sr-only">
                    WhatsApp number or email
                  </label>
                  <input
                    id="insider-contact"
                    type="text"
                    required
                    autoComplete="email"
                    placeholder="Enter WhatsApp Number or Email"
                    className="w-full min-h-12 pl-12 pr-4 py-3.5 rounded-full bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline shadow-sm focus:outline-2 focus:outline-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-12 px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-md whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-on-surface-variant pt-2">
              <div className="flex items-center gap-1.5 font-body-sm text-body-sm">
                <Icon name="verified_user" className="text-base text-secondary" />
                <span>No spam, unsubscribe any time</span>
              </div>
              <div className="flex items-center gap-1.5 font-body-sm text-body-sm">
                <Icon name="chat" className="text-base text-primary" />
                <span>Order updates via WhatsApp</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 h-full bg-primary-fixed-dim/30 flex items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold"
                >
                  IG
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">Iya Gbenga Desk</h3>
                  <span className="font-body-sm text-body-sm text-primary">Order on WhatsApp</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface">
                Prefer to order by chat? Message us your grocery list and we&apos;ll help you place your order.
              </div>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-11 py-2.5 px-4 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md hover:opacity-90 transition-opacity"
              >
                <Icon name="forum" className="text-base" />
                <span>Chat &amp; Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
