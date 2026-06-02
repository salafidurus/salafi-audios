import { useLocalSearchParams } from "expo-router";
import { PlaceholderRouteScreen } from "@/shared/components/placeholder-route-screen";

export default function CollectionDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <PlaceholderRouteScreen
      title="Collection detail"
      description={`Placeholder detail route for collection: ${id ?? "unknown"}.`}
    />
  );
}
