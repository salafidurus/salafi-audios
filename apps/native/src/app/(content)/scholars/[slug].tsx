import { useLocalSearchParams } from "expo-router";

import { ScholarDetailScreen } from "@/features/listing/screens/scholar-detail/scholar-detail.screen";

/** Provides the native app (content) scholars [slug] module responsibility. */
/** Describes the ScholarDetailRoute native function contract and behavior. */
export default function ScholarDetailRoute() {
  /** Describes the slug native field contract and behavior. */
  const { slug } = useLocalSearchParams<{
    /** Describes the slug native field contract and behavior. */
    slug: string;
  }>();
  return <ScholarDetailScreen slug={slug} />;
}
