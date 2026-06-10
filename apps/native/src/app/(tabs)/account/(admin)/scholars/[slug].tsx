import { useLocalSearchParams } from "expo-router";
import { AdminScholarDetailScreen } from "@/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen";

export default function AdminScholarDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <AdminScholarDetailScreen scholarSlug={slug} />;
}
