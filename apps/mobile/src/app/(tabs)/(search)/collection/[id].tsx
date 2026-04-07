import { useLocalSearchParams, useRouter } from "expo-router";
import { CollectionDetailMobileNativeScreen } from "@sd/feature-catalog";
import { routes } from "@sd/core-contracts";

export default function CollectionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <CollectionDetailMobileNativeScreen
      id={id}
      onNavigateToSeries={(seriesId) => router.push(routes.series.detail(seriesId) as never)}
    />
  );
}
