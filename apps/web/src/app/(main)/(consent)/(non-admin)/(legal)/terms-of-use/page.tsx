import type { Metadata } from "next";

import { TermsScreen } from "@/features/legal/screens/terms.screen";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using our service.",
};

export default function TermsOfUsePage() {
  return <TermsScreen />;
}
