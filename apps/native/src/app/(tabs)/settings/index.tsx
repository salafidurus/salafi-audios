import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { SettingsGeneralScreen } from "@/features/settings/screens/settings-general.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/settings route and delegates behavior to the feature layer. */
/** Renders the native settings index route surface and coordinates its user-facing state. */
export default function SettingsIndexRoute() {
  const router = useRouter();

  return (
    <SettingsGeneralScreen
      onNavigateToProfile={() => router.push(routes.settings.profile)}
      onNavigateToTerms={() => router.push(routes.settings.terms)}
      onNavigateToPrivacy={() => router.push(routes.settings.privacy)}
      onNavigateToSupport={() => router.push(routes.settings.support)}
      onNavigateToAdmin={() => router.push(routes.admin.index)}
    />
  );
}
