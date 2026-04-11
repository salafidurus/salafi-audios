import { useLocalSearchParams } from "expo-router";
import { PlaceholderRouteScreen } from "@/shared/components/placeholder-route-screen";

export default function SeriesDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <PlaceholderRouteScreen
      title="Series detail"
      description={`Placeholder detail route for series: ${id ?? "unknown"}.`}
    />
  );
}
