import type { Metadata } from "next";
import { AdminContentsScreen } from "@/features/admin/screens/admin-contents/admin-contents.screen";

export const metadata: Metadata = {
  title: "Listings | Admin",
  description: "Manage lectures, series, and audio content.",
};

export default function AdminContentsListingsPage() {
  return <AdminContentsScreen />;
}
