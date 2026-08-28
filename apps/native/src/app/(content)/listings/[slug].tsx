import { useLocalSearchParams } from "expo-router";

import { LectureDetailScreen } from "@/features/listing/screens/lecture-detail/lecture-detail.screen";

/** Provides the native app (content) listings [slug] module responsibility. */
/** Describes the LectureDetailRoute native function contract and behavior. */
export default function LectureDetailRoute() {
  /** Describes the slug native field contract and behavior. */
  const { slug } = useLocalSearchParams<{
    /** Describes the slug native field contract and behavior. */
    slug: string;
  }>();
  return <LectureDetailScreen slug={slug} />;
}
