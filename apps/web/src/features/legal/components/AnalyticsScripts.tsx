"use client";

import Script from "next/script";

import { isDev } from "@/core/config/env";

import { useCookieConsent } from "../hooks/use-cookie-consent";

export function AnalyticsScripts() {
  const { hasAccepted } = useCookieConsent();

  if (!hasAccepted || isDev) {
    return null;
  }

  return <Script src="https://www.vexo.co/analytics.js" strategy="afterInteractive" />;
}
