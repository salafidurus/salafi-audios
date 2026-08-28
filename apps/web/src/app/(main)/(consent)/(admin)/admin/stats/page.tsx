import type { Metadata } from "next";

import { AdminStatsScreen } from "@/features/admin/screens/admin-stats/admin-stats.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Admin Stats",
  description: "Platform statistics and analytics.",
};

export default function AdminStatsPage() {
  return <AdminStatsScreen />;
}
