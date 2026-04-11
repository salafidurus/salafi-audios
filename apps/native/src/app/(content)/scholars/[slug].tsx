import { useLocalSearchParams } from "expo-router";
import { ScholarDetailScreen } from "../../../features/scholar/screens/scholar-detail/scholar-detail.screen";

export default function ScholarDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ScholarDetailScreen slug={slug} />;
}
