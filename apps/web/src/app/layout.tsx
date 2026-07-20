import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";

import "./globals.css";
import { themeCss } from "./theme-css";

import { ThemeSync } from "../core/styles/ThemeSync";
import { Providers } from "../core/providers";

const fraunces = localFont({
  variable: "--font-display-en",
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
  variable: "--font-body-en",
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

const alexandria = localFont({
  variable: "--font-display-ar",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Alexandria-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Alexandria-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Alexandria-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Alexandria-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const ibmPlexSansArabic = localFont({
  variable: "--font-body-ar",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexSansArabic-Bold.ttf",
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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${fraunces.variable} ${manrope.variable} ${geistMono.variable} ${alexandria.variable} ${ibmPlexSansArabic.variable}`}
    >
      {/* lang/dir defaults — overridden beforeInteractive by the script below.
          Keeping root layout static avoids forcing every route to be dynamic. */}
      <body className="antialiased">
        {process.env.NODE_ENV === "production" && !apiBaseUrl?.includes("localhost") ? (
          <Script src="https://www.vexo.co/analytics.js" strategy="afterInteractive" />
        ) : null}
        {/* Must be beforeInteractive so lang/dir are set before first paint.
            Do NOT change to afterInteractive — it would cause RTL layout flash. */}
        <Script id="locale-init" strategy="beforeInteractive">
          {`!function(){var c=document.cookie.match(/(?:^|; )locale=([^;]*)/),l=c?c[1]:"en";document.documentElement.lang=l,document.documentElement.dir=l==="ar"?"rtl":"ltr"}()`}
        </Script>
        <style>{themeCss}</style>
        <ThemeSync />
        <Providers apiBaseUrl={apiBaseUrl} initialLocale="en">
          {children}
        </Providers>
      </body>
    </html>
  );
}
