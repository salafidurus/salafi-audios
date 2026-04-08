import { useLocalSearchParams } from "expo-router";
import { LectureDetailMobileNativeScreen } from "../../../../features/lecture/screens/lecture-detail/lecture-detail.screen";

export default function LectureRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <LectureDetailMobileNativeScreen
      id={id}
      onPlay={() => {
        /* TODO: wire to playback system */
      }}
    />
  );
}
