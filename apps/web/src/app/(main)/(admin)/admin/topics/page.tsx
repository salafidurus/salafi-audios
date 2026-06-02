import type { Metadata } from "next";
import { AdminTopicsScreen } from "@/features/admin/screens/admin-topics/admin-topics.screen";

export const metadata: Metadata = {
  title: "Manage Topics",
  description: "Create and manage lecture topics.",
};

export default function AdminTopicsPage() {
  return <AdminTopicsScreen />;
}
