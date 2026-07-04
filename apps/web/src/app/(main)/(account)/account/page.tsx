import type { Metadata } from "next";
import { SettingsGeneralScreen } from "@/features/account/screens/settings-general.screen";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your app language, display theme, and notification preferences.",
};

export default function AccountPage() {
  return <SettingsGeneralScreen />;
}
