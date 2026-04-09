import { useLocalSearchParams } from "expo-router";
import { LectureDetailScreen } from "../../../features/lecture/screens/lecture-detail/lecture-detail.screen";

export default function LectureDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <LectureDetailScreen id={id} />;
}
