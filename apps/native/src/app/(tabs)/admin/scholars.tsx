import { useRouter } from "expo-router";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/admin/scholars route and delegates behavior to the feature layer. */
/** Renders the native admin scholars route surface and coordinates its user-facing state. */
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
