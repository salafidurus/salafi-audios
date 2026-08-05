"use client";

import { MiniPlayer } from "@/features/audio";
import { CookieConsentGate, AnalyticsScripts } from "@/features/legal";
import { Footer } from "@/features/navigation/components/footer/footer";
import { Sidebar } from "@/features/navigation/components/sidebar/sidebar";

export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookieConsentGate />
      <AnalyticsScripts />
      <div className="appFrame">
        <div className="appConsentShell">
          <Sidebar />
          <div className="appConsentMain">
            <div className="appConsentContent">{children}</div>
            <MiniPlayer />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
