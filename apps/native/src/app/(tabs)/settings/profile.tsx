import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { authClient } from "@/core/auth/auth-client";
import { queryClient } from "@/core/query-client";
import { SettingsProfileScreen } from "@/features/settings/screens/settings-profile.screen";

export default function SettingsProfileRoute() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.replace(routes.home);
  };

  return (
    <SettingsProfileScreen
      onSignOut={handleSignOut}
      onSignIn={() =>
        router.push({
          pathname: routes.signIn,
          params: { from: `${routes.settings.index}?tab=profile` },
        })
      }
    />
  );
}
