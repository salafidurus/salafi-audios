import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth/auth-client";
import { AccountScreen } from "@/features/account/screens/account.screen";

export default function AccountIndexRoute() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace(routes.home as Href);
  };

  return (
    <AccountScreen
      onNavigateToProfile={() => router.push(routes.account.profile as Href)}
      onNavigateToLegal={() => router.push(routes.account.legal as Href)}
      onSignOut={handleSignOut}
    />
  );
}
