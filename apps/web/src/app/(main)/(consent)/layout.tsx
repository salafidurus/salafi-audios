"use client";

import { Footer } from "@/features/navigation/components/footer/footer";
import { Sidebar } from "@/features/navigation/components/sidebar/sidebar";
import { TopSubnavTabs } from "@/features/navigation/components/top-subnav-tabs/top-subnav-tabs";
import { MiniPlayer } from "@/features/audio";
import { CookieConsentGate, AnalyticsScripts } from "@/features/legal";

export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <>
      <CookieConsentGate />
      <AnalyticsScripts apiBaseUrl={apiBaseUrl} />
      <div className="appFrame">
        <div className="appShell">
          <Sidebar />
          <div className="appMain">
            <TopSubnavTabs />
            <div className="appContent">{children}</div>
            <MiniPlayer />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
