import type { Metadata } from "next";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the authenticated scholar-management route. */
export const metadata: Metadata = {
  title: "Manage Scholars",
  description: "Create and manage scholar profiles.",
};

/** Renders the admin scholar-management screen. */
export default function AdminScholarsPage() {
  return <AdminScholarsScreen />;
}
