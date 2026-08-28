import { useRouter } from "expo-router";

import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/admin route and delegates behavior to the feature layer. */
/** Renders the native admin dashboard route surface and coordinates its user-facing state. */
export default function AdminDashboardRoute() {
  const router = useRouter();

  return (
    <AdminDashboardScreen
      onNavigateToListings={() => router.push("/(tabs)/admin/listings")}
      onNavigateToScholars={() => router.push("/(tabs)/admin/scholars")}
    />
  );
}
