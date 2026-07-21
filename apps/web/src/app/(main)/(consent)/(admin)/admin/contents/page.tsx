import type { Metadata } from "next";
import { AdminContentsScreen } from "@/features/admin/screens/admin-contents/admin-contents.screen";

export const metadata: Metadata = {
  title: "Topics | Admin",
  description: "Manage content topics and categories.",
};

export default function AdminContentsPage() {
  return <AdminContentsScreen />;
}
