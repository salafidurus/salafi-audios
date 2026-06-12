import type { Metadata } from "next";
import { AdminScholarDetailScreen } from "@/features/admin/screens/admin-scholar-detail/admin-scholar-detail.screen";

export const metadata: Metadata = {
  title: "Scholar Details - Admin",
  description: "Manage scholar series, collections, and content ordering.",
};

export default async function AdminScholarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminScholarDetailScreen id={id} />;
}
