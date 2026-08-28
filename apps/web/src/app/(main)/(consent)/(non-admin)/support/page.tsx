import type { Metadata } from "next";

import { SupportScreen } from "@/features/support/screens/support.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Support",
  description: "Get help and support for using the platform.",
};

export default function SupportPage() {
  return <SupportScreen />;
}
