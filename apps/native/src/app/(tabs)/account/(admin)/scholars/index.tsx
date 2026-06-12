import { type Href, useRouter } from "expo-router";
import { AdminScholarsScreen } from "@/features/admin-scholars/screens/admin-scholars/admin-scholars.screen";

export default function AdminScholarsRoute() {
  const router = useRouter();
  return (
    <AdminScholarsScreen
      onNavigateToScholar={(slug) =>
        router.push(`/(tabs)/account/(admin)/scholars/${slug}` as Href)
      }
    />
  );
}
