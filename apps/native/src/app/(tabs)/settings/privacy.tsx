import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { LegalToggleScreen } from "@/features/settings";

/** Resolves the native stack back action and renders the shared Privacy Policy document. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- this route has no additional public contract beyond its router entrypoint.
export default function SettingsPrivacyRoute() {
  const router = useRouter();
  return (
    <LegalToggleScreen
      documentId="privacy"
      onBack={() => router.back()}
      onNavigateToSupport={() => router.push(routes.settings.support)}
    />
  );
}
