import { useLocalSearchParams } from "expo-router";
import { ScholarDetailMobileNativeScreen } from "../../../../features/scholar/screens/scholar-detail/scholar-detail.screen";

export default function ScholarScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ScholarDetailMobileNativeScreen slug={slug} />;
}
