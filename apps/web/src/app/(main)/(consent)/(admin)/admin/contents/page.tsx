import type { Metadata } from "next";

import { AdminContentsScreen } from "@/features/admin/screens/admin-contents/admin-contents.screen";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the authenticated admin content-management route. */
export const metadata: Metadata = {
  title: "Topics | Admin",
  description: "Manage content topics and categories.",
};

/** Renders the admin topics and content-management screen. */
export default function AdminContentsPage() {
  return <AdminContentsScreen />;
}
