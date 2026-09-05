import type { Metadata } from "next";

import { PrivacyScreen } from "@/features/legal/screens/privacy.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the public privacy-policy route. */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy and how we handle your data.",
};

/** Renders the public privacy-policy screen. */
export default function PrivacyPage() {
  return <PrivacyScreen />;
}
