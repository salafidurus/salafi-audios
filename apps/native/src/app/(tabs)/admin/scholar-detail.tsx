import { useLocalSearchParams } from "expo-router";

import { AdminScholarDetailScreen } from "@/features/admin/screens/admin-scholar-detail/admin-scholar-detail.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/admin/scholar-detail route and delegates behavior to the feature layer. */
/** Renders the native admin scholar detail route surface and coordinates its user-facing state. */
export default function AdminScholarDetailRoute() {
  /** Carries the canonical route identity used to load the selected content. */
  const { slug } = useLocalSearchParams<{
    /** Carries the canonical route identity used to load the selected content. */
    slug: string;
  }>();

  return <AdminScholarDetailScreen scholarSlug={slug ?? ""} />;
}
