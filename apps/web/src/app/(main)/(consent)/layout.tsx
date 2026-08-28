/** Documents this module's responsibility and public boundary. */
"use client";

import { MiniPlayer } from "@/features/audio";
import { CookieConsentGate, AnalyticsScripts } from "@/features/legal";
import { PublicShell } from "@/features/navigation/components/public-shell/public-shell";

export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookieConsentGate />
      <AnalyticsScripts />
      <PublicShell beforeFooter={<MiniPlayer />}>{children}</PublicShell>
    </>
  );
}
