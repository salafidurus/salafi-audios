import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth/auth-client";
import { AccountScreen } from "@/features/settings/screens/account.screen";
import { queryClient, persister } from "@/core/providers";

export default function AccountIndexRoute() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    await persister.removeClient();
    router.replace(routes.home as Href);
  };

  return (
    <AccountScreen
      onNavigateToProfile={() => router.push(routes.settings.profile as Href)}
      onNavigateToLegal={() => router.push(routes.settings.legal as Href)}
      onSignOut={handleSignOut}
    />
  );
}
