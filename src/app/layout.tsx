import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/store/Toast";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Iya Gbenga's Store", template: "%s | Iya Gbenga's Store" },
  description:
    "Authentic Nigerian groceries delivered fresh: yams, palm oil, garri, dried fish, crayfish, peppers and soup bundles.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} antialiased`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background font-body-md text-on-surface">
        <StoreProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
