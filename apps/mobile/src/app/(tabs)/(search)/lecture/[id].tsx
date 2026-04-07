import { useLocalSearchParams } from "expo-router";
import { LectureDetailMobileNativeScreen } from "@sd/feature-lecture";

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
