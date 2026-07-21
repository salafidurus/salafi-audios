"use client";

import Script from "next/script";
import { useCookieConsent } from "../hooks/use-cookie-consent";

interface AnalyticsScriptsProps {
  apiBaseUrl?: string;
}

export function AnalyticsScripts({ apiBaseUrl }: AnalyticsScriptsProps) {
  const { hasAccepted } = useCookieConsent();

  const shouldLoadAnalytics =
    process.env.NODE_ENV === "production" && !apiBaseUrl?.includes("localhost");

  if (!hasAccepted || !shouldLoadAnalytics) {
    return null;
  }

  return <Script src="https://www.vexo.co/analytics.js" strategy="afterInteractive" />;
}
