import type { Metadata } from "next";
import { AdminStatsScreen } from "@/features/admin/screens/admin-stats/admin-stats.screen";

export const metadata: Metadata = {
  title: "Admin Stats",
  description: "Platform statistics and analytics.",
};

export default function AdminStatsPage() {
  return <AdminStatsScreen />;
}
