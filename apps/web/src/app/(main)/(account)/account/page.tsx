import type { Metadata } from "next";
import { AccountScreen } from "@/features/account/screens/account.screen";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings and preferences.",
};

export default function AccountPage() {
  return <AccountScreen />;
}
