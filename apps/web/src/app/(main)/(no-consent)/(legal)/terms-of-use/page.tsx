import type { Metadata } from "next";
import { TermsScreen } from "@/features/legal/screens/terms.screen";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the platform.",
};

export default function TermsOfUsePage() {
  return <TermsScreen />;
}
