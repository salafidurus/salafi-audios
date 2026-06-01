import type { Metadata } from "next";
import { AccountActions } from "@/features/account/screens/account-actions";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings and preferences.",
};

export default function AccountPage() {
  return <AccountActions />;
}
