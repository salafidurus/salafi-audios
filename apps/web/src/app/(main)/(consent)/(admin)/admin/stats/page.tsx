import type { Metadata } from "next";

import { AdminStatsScreen } from "@/features/admin/screens/admin-stats/admin-stats.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the authenticated statistics route. */
export const metadata: Metadata = {
  title: "Admin Stats",
  description: "Platform statistics and analytics.",
};

/** Renders the admin statistics screen. */
export default function AdminStatsPage() {
  return <AdminStatsScreen />;
}
