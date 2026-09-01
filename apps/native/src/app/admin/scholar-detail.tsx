import { useLocalSearchParams } from "expo-router";

import { AdminScholarDetailScreen } from "@/features/admin/screens/admin-scholar-detail/admin-scholar-detail.screen";

/** Defines the independent Admin scholar-detail route outside the persistent tab shell. */
/** Renders the selected Admin scholar detail and passes its route identity to the feature screen. */
export default function AdminScholarDetailRoute() {
  // oxlint-disable-next-line anti-slop/require-tsdoc -- Expo Router owns this framework parameter shape.
  const params = useLocalSearchParams<{ slug?: string }>();
  /** Identifies the scholar selected by the Admin list. */
  const slug = params.slug;

  return <AdminScholarDetailScreen scholarSlug={slug ?? ""} />;
}
