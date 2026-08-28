import type { Metadata } from "next";

import { AdminUsersScreen } from "@/features/admin/screens/admin-users/admin-users.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Admin Users",
  description: "Manage admin user access.",
};

export default function AdminUsersPage() {
  return <AdminUsersScreen />;
}
