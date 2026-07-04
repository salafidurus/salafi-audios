import type { LectureDetailDto } from "@sd/core-contracts";
import { useAudio } from "@sd/domain-audio";
import type { Track } from "@sd/domain-audio";
import { audioService } from "@/features/audio";
import { Button } from "@/shared/components/Button/Button";
import { Play, Pause } from "lucide-react-native";
import { useUnistyles } from "react-native-unistyles";

export type LecturePlayButtonProps = {
  lecture: LectureDetailDto;
};

export function LecturePlayButton({ lecture }: LecturePlayButtonProps) {
  const { isPlaying, currentTrack, isLoading } = useAudio();
  const { theme } = useUnistyles();

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
            url: "", // resolved lazily by DurusAudioService
            durationSeconds: 0,
            seriesId: lecture.seriesContext?.seriesId ?? null,
            seriesTitle: lecture.seriesContext?.seriesTitle ?? null,
          },
        ]
      : [track];

    await audioService.playLecture(track, queueContext);
  };

  const isPausing = isCurrentAsset && isPlaying;
  const label = isPausing ? "Pause Lecture" : "Play Lecture";
  const icon = isPausing ? (
    <Pause size={20} color={theme.colors.content.onPrimary} fill={theme.colors.content.onPrimary} />
  ) : (
    <Play size={20} color={theme.colors.content.onPrimary} fill={theme.colors.content.onPrimary} />
  );

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      label={label}
      icon={icon}
      iconPosition="left"
      loading={isCurrentAsset && isLoading}
      onPress={handlePress}
    />
  );
}
