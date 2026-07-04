import type { Metadata } from "next";
import { AdminContentsScreen } from "@/features/admin/screens/admin-contents/admin-contents.screen";

export const metadata: Metadata = {
  title: "Admin Contents",
  description: "Content management for series, collections, and metadata.",
};

export default function AdminContentsPage() {
  return <AdminContentsScreen />;
}
