import type { LectureDetailDto } from "@sd/core-contracts";
import { usePlayback } from "@sd/domain-playback";
import type { Track } from "@sd/domain-playback";
import { ButtonMobileNative } from "../../../../shared/components/Button/Button";

export type LecturePlayButtonNativeProps = {
  lecture: LectureDetailDto;
};

export function LecturePlayButtonNative({ lecture }: LecturePlayButtonNativeProps) {
  const { play } = usePlayback();

  if (!lecture.primaryAudioAsset) {
    return null;
  }

  const asset = lecture.primaryAudioAsset;

  const handlePress = () => {
    const track: Track = {
      id: asset.id,
      lectureId: lecture.id,
      title: lecture.title,
      scholarName: lecture.scholar.name,
      audioUrl: asset.url,
      durationSeconds: asset.durationSeconds ?? lecture.durationSeconds,
      artworkUrl: undefined,
    };
    play(track);
  };

  return (
    <ButtonMobileNative
      variant="primary"
      size="lg"
      fullWidth
      label="▶ Play Lecture"
      onPress={handlePress}
    />
  );
}
