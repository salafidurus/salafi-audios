import type { Metadata } from "next";
import { AdminUsersScreen } from "@/features/admin/screens/admin-users/admin-users.screen";

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Manage admin user permissions and access.",
};

export default function AdminUsersPage() {
  return <AdminUsersScreen />;
}
