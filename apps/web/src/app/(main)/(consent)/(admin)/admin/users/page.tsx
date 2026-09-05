import type { Metadata } from "next";

import { AdminUsersScreen } from "@/features/admin/screens/admin-users/admin-users.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the authenticated admin user-management route. */
export const metadata: Metadata = {
  title: "Admin Users",
  description: "Manage admin user access.",
};

/** Renders the admin user-management screen. */
export default function AdminUsersPage() {
  return <AdminUsersScreen />;
}
