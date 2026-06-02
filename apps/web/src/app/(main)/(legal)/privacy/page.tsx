import type { Metadata } from "next";
import { PrivacyScreen } from "@/features/legal/screens/privacy.screen";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy and how we handle your data.",
};

export default function PrivacyPage() {
  return <PrivacyScreen />;
}
