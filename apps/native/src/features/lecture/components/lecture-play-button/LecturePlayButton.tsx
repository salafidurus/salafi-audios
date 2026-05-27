import type { LectureDetailDto } from "@sd/core-contracts";
import { useAudio } from "@sd/domain-audio";
import type { Track } from "@sd/domain-audio";
import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/Button/Button";

export type LecturePlayButtonProps = {
  lecture: LectureDetailDto;
};

export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
  const { isPlaying, currentTrack } = useAudio();

  if (!lecture.primaryAudioAsset) {
    return null;
  }

  const asset = lecture.primaryAudioAsset;
  const isCurrentAsset = currentTrack?.id === asset.id;

  const handlePress = async () => {
    if (isCurrentAsset) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    const track: Track = {
      id: asset.id,
      title: lecture.title,
      artist: lecture.scholar.name,
      url: asset.url,
      durationSeconds: asset.durationSeconds ?? lecture.durationSeconds ?? 0,
      artworkUrl: undefined,
      seriesId: lecture.seriesContext?.seriesId ?? null,
      seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
    };

    const nextLecture = lecture.seriesContext?.nextLecture;
    const queueContext: Track[] = nextLecture
      ? [
          track,
          {
            id: nextLecture.id,
            title: nextLecture.title,
            artist: lecture.scholar.name,
            url: '', // resolved lazily by DurusAudioService
            durationSeconds: 0,
            seriesId: lecture.seriesContext?.seriesId ?? null,
            seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
          },
        ]
      : [track];

    await audioService.playLecture(track, queueContext);
  };

  const label = isCurrentAsset && isPlaying ? "⏸ Pause Lecture" : "▶ Play Lecture";

  return (
    <Button variant="primary" size="lg" fullWidth label={label} onPress={handlePress} />
  );
}
