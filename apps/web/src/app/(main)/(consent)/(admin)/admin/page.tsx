import type { Metadata } from "next";

import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform administration and management.",
};

export default function AdminPage() {
  return <AdminDashboardScreen />;
}
