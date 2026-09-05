/** Provides the public shell and consent-aware services for public routes. */
"use client";

import { MiniPlayer } from "@/features/audio";
import { CookieConsentGate, AnalyticsScripts } from "@/features/legal";
import { PublicShell } from "@/features/navigation/components/public-shell/public-shell";

/** Wraps public pages with cookie consent, analytics, navigation, and playback UI. */
export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookieConsentGate />
      <AnalyticsScripts />
      <PublicShell beforeFooter={<MiniPlayer />}>{children}</PublicShell>
    </>
  );
}
