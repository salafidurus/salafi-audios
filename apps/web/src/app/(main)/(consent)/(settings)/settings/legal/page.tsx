import type { Metadata } from "next";
import { SettingsLegalScreen } from "@/features/settings/screens/settings-legal.screen";

export const metadata: Metadata = {
  title: "Legal — Settings",
  description: "View the Privacy Policy and Terms of Use for Salafi Durus.",
};

export default function AccountLegalPage() {
  return <SettingsLegalScreen />;
}
