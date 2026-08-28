import type { Metadata } from "next";

import { Suspense } from "react";

import { SettingsGeneralScreen } from "@/features/settings/screens/settings-general.screen";

/** Defines the authenticated account settings route. */
/** Supplies metadata while the client settings screen resolves. */
export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your app language, display theme, and notification preferences.",
};

/** Renders the general settings screen while preserving its client-only state. */
export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <SettingsGeneralScreen />
    </Suspense>
  );
}
