import { useLocalSearchParams } from "expo-router";
import { LectureDetailScreen } from "@/features/listing/screens/lecture-detail/lecture-detail.screen";

export default function LectureDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LectureDetailScreen slug={slug} />;
}
