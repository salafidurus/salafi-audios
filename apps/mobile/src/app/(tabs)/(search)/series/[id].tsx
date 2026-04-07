import { useLocalSearchParams } from "expo-router";
import { SeriesDetailMobileNativeScreen } from "@sd/feature-catalog";

export default function SeriesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SeriesDetailMobileNativeScreen id={id} />;
}
