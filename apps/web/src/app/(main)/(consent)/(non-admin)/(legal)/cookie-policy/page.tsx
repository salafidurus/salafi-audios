import type { Metadata } from "next";

import { CookiePolicyScreen } from "@/features/legal/screens/cookie-policy.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the public cookie-policy route. */
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Our cookies policy and how we use cookies on our website.",
};

/** Renders the public cookie-policy screen. */
export default function CookiePolicyPage() {
  return <CookiePolicyScreen />;
}
