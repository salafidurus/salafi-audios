import { useRouter } from "expo-router";

import { AdminDashboardScreen } from "@/features/admin/screens/admin-dashboard/admin-dashboard.screen";

/** The dashboard owns links to the independent Admin listings and scholars stacks. */
/** Renders the Admin dashboard entrypoint while keeping route composition in the app layer. */
export default function AdminIndexRoute() {
  const router = useRouter();

  return (
    <AdminDashboardScreen
      onNavigateToListings={() => router.push("/admin/listings")}
      onNavigateToScholars={() => router.push("/admin/scholars")}
    />
  );
}
