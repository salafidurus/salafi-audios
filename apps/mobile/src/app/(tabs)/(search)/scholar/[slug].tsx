import { useLocalSearchParams, useRouter } from "expo-router";
import { ScholarDetailMobileNativeScreen } from "@sd/feature-catalog";
import { routes } from "@sd/core-contracts";

export default function ScholarRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  return (
    <ScholarDetailMobileNativeScreen
      slug={slug}
      onNavigateToCollection={(id) => router.push(routes.collections.detail(id) as never)}
      onNavigateToSeries={(id) => router.push(routes.series.detail(id) as never)}
    />
  );
}
