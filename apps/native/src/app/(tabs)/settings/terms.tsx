import { useRouter } from "expo-router";

import { LegalToggleScreen } from "@/features/settings";

/** Resolves the native stack back action and renders the shared Terms and Conditions document. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- this route has no additional public contract beyond its router entrypoint.
export default function SettingsTermsRoute() {
  const router = useRouter();
  return <LegalToggleScreen documentId="terms" onBack={() => router.back()} />;
}
