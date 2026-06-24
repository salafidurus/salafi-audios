import type { Metadata } from "next";
import { AccountProfilePageClient } from "./account-profile-page.client";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update your profile information.",
};

export default function AccountProfilePage() {
  return <AccountProfilePageClient />;
}
