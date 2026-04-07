import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { usePlayback } from "@sd/domain-playback";
import { ProgressBarNative } from "../components/progress-bar/progress-bar.native";
import { PlaybackControlsNative } from "../components/playback-controls/playback-controls.native";

export type PlayerFullscreenNativeScreenProps = {
  onClose?: () => void;
};

export function PlayerFullscreenNativeScreen({ onClose }: PlayerFullscreenNativeScreenProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progressPercent,
    positionSeconds,
    durationSeconds,
    pause,
    resume,
    skipToNext,
  } = usePlayback();

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        {/* Header with close */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close player">
            <Text style={{ fontSize: 28, color: "#666" }}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Track info */}
        <View style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 16,
              backgroundColor: "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 48 }}>🎧</Text>
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {currentTrack.title}
          </Text>
          {currentTrack.scholarName && (
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              {currentTrack.scholarName}
            </Text>
          )}
        </View>

        {/* Progress & controls */}
        <View style={{ gap: 16, paddingBottom: 32 }}>
          <ProgressBarNative progressPercent={progressPercent} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ fontSize: 12, color: "#999" }}>{formatTime(positionSeconds)}</Text>
            <Text style={{ fontSize: 12, color: "#999" }}>{formatTime(durationSeconds)}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <PlaybackControlsNative
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlayPause={handlePlayPause}
              onSkipNext={skipToNext}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
