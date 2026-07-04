import type { Metadata } from "next";
import { SettingsProfileScreen } from "@/features/account/screens/settings-profile.screen";

export const metadata: Metadata = {
  title: "Profile — Settings",
  description: "View and update your profile information.",
};

export default function AccountProfilePage() {
  return <SettingsProfileScreen />;
}
