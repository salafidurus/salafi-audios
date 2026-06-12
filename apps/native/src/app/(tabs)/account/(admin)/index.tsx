import { type Href, useRouter } from "expo-router";
import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

export default function AdminIndexRoute() {
  const router = useRouter();
  return (
    <AdminDashboardScreen
      onNavigateToLectures={() => router.push("/(tabs)/account/(admin)/lectures" as Href)}
      onNavigateToLive={() => router.push("/(tabs)/account/(admin)/live" as Href)}
      onNavigateToScholars={() => router.push("/(tabs)/account/(admin)/scholars" as Href)}
      onNavigateToPermissions={() => {
        /* future permissions screen */
      }}
    />
  );
}
