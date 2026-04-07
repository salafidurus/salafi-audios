import { View, Text } from "react-native";
import { usePlayback } from "@sd/domain-playback";
import { ProgressBarNative } from "../progress-bar/progress-bar.native";
import { PlaybackControlsNative } from "../playback-controls/playback-controls.native";

export function MiniPlayerNative() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    hasTrack,
    progressPercent,
    durationSeconds,
    positionSeconds,
    pause,
    resume,
    skipToNext,
  } = usePlayback();

  if (!hasTrack || !currentTrack) return null;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#fafafa",
        gap: 6,
      }}
    >
      <ProgressBarNative progressPercent={progressPercent} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600" }}>
            {currentTrack.title}
          </Text>
          {currentTrack.scholarName && (
            <Text numberOfLines={1} style={{ fontSize: 12, color: "#666" }}>
              {currentTrack.scholarName}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: "#999" }}>
          {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
        </Text>
        <PlaybackControlsNative
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={handlePlayPause}
          onSkipNext={skipToNext}
        />
      </View>
    </View>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
