import { useLocalSearchParams } from "expo-router";
import { ScholarDetailMobileNativeScreen } from "@sd/feature-scholar";

export default function ScholarScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ScholarDetailMobileNativeScreen slug={slug} />;
}
