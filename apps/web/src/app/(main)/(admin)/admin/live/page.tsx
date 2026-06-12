import type { Metadata } from "next";
import { AdminLivestreamsScreen } from "@/features/admin/screens/admin-livestreams/admin-livestreams.screen";

export const metadata: Metadata = {
  title: "Manage Livestreams - Admin",
  description: "Schedule and manage live streaming events.",
};

export default function AdminLivePage() {
  return <AdminLivestreamsScreen />;
}
