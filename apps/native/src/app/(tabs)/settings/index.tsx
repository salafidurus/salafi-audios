import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { authClient } from "@/core/auth/auth-client";
import { queryClient } from "@/core/query-client";
import { SettingsGeneralScreen } from "@/features/settings/screens/settings-general.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/settings route and delegates behavior to the feature layer. */
/** Renders the native settings index route surface and coordinates its user-facing state. */
export default function SettingsIndexRoute() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.replace(routes.home);
  };

  return (
    <SettingsGeneralScreen
      onNavigateToProfile={() => router.push(routes.settings.profile)}
      onNavigateToLegal={() => router.push(routes.settings.legal)}
      onNavigateToSupport={() => router.push(routes.settings.support)}
      onNavigateToAdmin={() => router.push(routes.admin.index)}
      onSignOut={handleSignOut}
    />
  );
}
