import type { LectureDetailDto } from "@sd/core-contracts";
import { usePlayback } from "@sd/domain-playback";
import type { Track } from "@sd/domain-playback";
import { Button } from "../../../../shared/components/Button/Button";

export type LecturePlayButtonProps = {
  lecture: LectureDetailDto;
};

export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
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
    <Button variant="primary" size="lg" fullWidth label="▶ Play Lecture" onPress={handlePress} />
  );
}
