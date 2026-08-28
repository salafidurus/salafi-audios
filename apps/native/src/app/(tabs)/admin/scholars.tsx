import { useRouter } from "expo-router";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

/** Provides the native app (tabs) admin scholars module responsibility. */
/** Describes the AdminScholarsRoute native function contract and behavior. */
export default function AdminScholarsRoute() {
  const router = useRouter();

  return (
    <AdminScholarsScreen
      onNavigateToScholar={(slug) =>
        router.push({ pathname: "/(tabs)/admin/scholar-detail", params: { slug } })
      }
    />
  );
}
