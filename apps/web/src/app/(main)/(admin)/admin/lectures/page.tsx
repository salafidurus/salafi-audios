import type { Metadata } from "next";
import { AdminLecturesScreen } from "@/features/admin-lectures";

export const metadata: Metadata = {
  title: "Manage Lectures - Admin",
  description: "Upload and manage lectures, adjust metadata, and set custom order.",
};

export default function AdminLecturesPage() {
  return <AdminLecturesScreen />;
}
