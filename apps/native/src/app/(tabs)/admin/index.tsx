import { useRouter } from "expo-router";

import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

export default function AdminDashboardRoute() {
  const router = useRouter();

  return (
    <AdminDashboardScreen
      onNavigateToLectures={() => router.push("/(tabs)/admin/lectures")}
      onNavigateToScholars={() => router.push("/(tabs)/admin/scholars")}
    />
  );
}
