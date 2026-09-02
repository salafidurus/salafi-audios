import { useRouter } from "expo-router";

import { LegalToggleScreen } from "@/features/settings";

/** Defines the Expo Router entrypoint for the native (tabs)/settings/legal route and delegates behavior to the feature layer. */
/** Renders the native account legal route surface and coordinates its user-facing state. */
export default function AccountLegalRoute() {
  const router = useRouter();
  return <LegalToggleScreen documentId="terms" onBack={() => router.back()} />;
}
