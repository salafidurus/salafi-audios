import type { Metadata } from "next";

import { TermsScreen } from "@/features/legal/screens/terms.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the public terms-of-use route. */
export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using our service.",
};

/** Renders the public terms-of-use screen. */
export default function TermsOfUsePage() {
  return <TermsScreen />;
}
