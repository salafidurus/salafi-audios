import type { Metadata } from "next";
import { AdminLivestreamsScreen } from "@/features/admin/screens/admin-livestreams/admin-livestreams.screen";

export const metadata: Metadata = {
  title: "Channels | Admin",
  description: "Manage livestream channels.",
};

export default function AdminLiveChannelsPage() {
  return <AdminLivestreamsScreen />;
}
