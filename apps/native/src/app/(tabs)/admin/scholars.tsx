import { useRouter } from "expo-router";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

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
