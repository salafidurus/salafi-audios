import type { Metadata } from "next";

import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

/** Defines the protected administration dashboard route. */
/** Supplies metadata for administrative content and access tools. */
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform administration and management.",
};

/** Renders the aggregate administration dashboard for authorized users. */
export default function AdminPage() {
  return <AdminDashboardScreen />;
}
