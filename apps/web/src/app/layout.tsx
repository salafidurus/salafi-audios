import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { themeCss } from "./theme-css";

import { Header } from "@/features/navigation/components/header/header";
import { Footer } from "@/features/navigation/components/footer/footer";

const fraunces = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Fraunces-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fraunces-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fraunces-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const manrope = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Manrope-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Manrope-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Manrope-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Manrope-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const geistMono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/GeistMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const metadataBase =
  process.env.NEXT_PUBLIC_WEB_URL && process.env.NEXT_PUBLIC_WEB_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_WEB_URL)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Salafi Durus",
    template: "%s | Salafi Durus",
  },
  description:
    "Browse published scholars, collections, series, and lectures in the Salafi Durus library.",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
      >
        <style>{themeCss}</style>
        <div className="appFrame">
          <Header searchPlaceholder="Search for lectures, books, or scholars..." />
          <div className="appMain">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
