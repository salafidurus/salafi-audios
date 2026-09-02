import { useLocalSearchParams } from "expo-router";

import { ScholarDetailScreen } from "@/features/listing/screens/scholar-detail/scholar-detail.screen";

/** Defines the Expo Router entrypoint for the native (content)/scholars/:slug route and delegates behavior to the feature layer. */
/** Renders the native scholar detail route surface and coordinates its user-facing state. */
export default function ScholarDetailRoute() {
  /** Carries the canonical route identity used to load the selected content. */
  const { slug } = useLocalSearchParams<{
    /** Carries the canonical route identity used to load the selected content. */
    slug: string;
  }>();
  return <ScholarDetailScreen slug={slug} />;
}
