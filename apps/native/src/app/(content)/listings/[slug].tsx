import { useLocalSearchParams } from "expo-router";

import { LectureDetailScreen } from "@/features/listing/screens/lecture-detail/lecture-detail.screen";

/** Defines the Expo Router entrypoint for the native (content)/listings/:slug route and delegates behavior to the feature layer. */
/** Renders the native lecture detail route surface and coordinates its user-facing state. */
export default function LectureDetailRoute() {
  /** Carries the canonical route identity used to load the selected content. */
  const { slug } = useLocalSearchParams<{
    /** Carries the canonical route identity used to load the selected content. */
    slug: string;
  }>();
  return <LectureDetailScreen slug={slug} />;
}
