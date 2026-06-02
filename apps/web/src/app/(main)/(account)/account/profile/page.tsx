import type { Metadata } from "next";
import { AccountProfileScreen } from "@/features/account/screens/account-profile.screen";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update your profile information.",
};

export default function AccountProfilePage() {
  return <AccountProfileScreen />;
}
