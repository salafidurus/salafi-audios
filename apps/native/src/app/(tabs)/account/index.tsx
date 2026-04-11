import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { AccountScreen } from "../../../features/account/screens/account.screen";

export default function AccountIndexRoute() {
  const router = useRouter();

  return (
    <AccountScreen
      onNavigateToProfile={() => router.push(routes.account.profile as Href)}
      onNavigateToLegal={() => router.push(routes.account.legal as Href)}
    />
  );
}
