import { routes } from "@sd/core-contracts";
import { type Href, useRouter } from "expo-router";

import { authClient } from "@/core/auth/auth-client";
import { queryClient } from "@/core/query-client";
import { SettingsProfileScreen } from "@/features/settings/screens/settings-profile.screen";

export default function SettingsProfileRoute() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.replace(routes.home as Href);
  };

  return (
    <SettingsProfileScreen
      onSignOut={handleSignOut}
      onSignIn={() =>
        router.push({ pathname: routes.signIn, params: { from: routes.settings.profile } })
      }
    />
  );
}
