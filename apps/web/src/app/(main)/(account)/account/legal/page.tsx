import type { Metadata } from "next";
import { AccountScreen } from "@/features/account/screens/account.screen";

export const metadata: Metadata = {
  title: "Legal",
  description: "Legal information and agreements for your account.",
};

export default function AccountLegalPage() {
  return <AccountScreen />;
}
