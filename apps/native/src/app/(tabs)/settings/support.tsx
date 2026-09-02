import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { SupportScreen } from "@/features/settings";

/** Defines the Expo Router entrypoint for the native (tabs)/settings/support route and delegates behavior to the feature layer. */
/** Renders the native support route surface and coordinates its user-facing state. */
export default function SupportRoute() {
  const router = useRouter();
  return (
    <SupportScreen
      onBack={() => router.back()}
      onNavigateToTerms={() => router.push(routes.settings.terms)}
      onNavigateToPrivacy={() => router.push(routes.settings.privacy)}
    />
  );
}
