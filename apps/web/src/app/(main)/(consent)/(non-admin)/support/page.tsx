import type { Metadata } from "next";

import { SupportScreen } from "@/features/support/screens/support.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata used by the public support route. */
export const metadata: Metadata = {
  title: "Support",
  description: "Get help and support for using the platform.",
};

/** Renders the public support screen without requiring an authenticated session. */
export default function SupportPage() {
  return <SupportScreen />;
}
