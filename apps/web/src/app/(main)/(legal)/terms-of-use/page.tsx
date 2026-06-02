import type { Metadata } from "next";
import { TermsOfUseScreen } from "@/features/legal/screens/terms-of-use.screen";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the platform.",
};

export default function TermsOfUsePage() {
  return <TermsOfUseScreen />;
}
