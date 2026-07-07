import type { Metadata } from "next";
import { AdminLecturesScreen } from "@/features/admin/screens/admin-lectures/admin-lectures.screen";

export const metadata: Metadata = {
  title: "Admin Lectures",
  description: "Manage lectures and audio content.",
};

export default function AdminLecturesPage() {
  return <AdminLecturesScreen />;
}
