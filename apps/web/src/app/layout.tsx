import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    "Browse published scholars, collections, series, and lectures in the Salafi Durus catalog.",
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
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
