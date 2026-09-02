import type { Metadata } from "next";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

/** Documents this module's responsibility and public boundary. */
export const metadata: Metadata = {
  title: "Manage Scholars",
  description: "Create and manage scholar profiles.",
};

export default function AdminScholarsPage() {
  return <AdminScholarsScreen />;
}
