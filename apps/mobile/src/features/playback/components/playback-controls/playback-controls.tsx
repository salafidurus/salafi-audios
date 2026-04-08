import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";

type PlaybackControlsNativeProps = {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onSkipNext?: () => void;
};

export function PlaybackControlsNative({
  isPlaying,
  isLoading,
  onPlayPause,
  onSkipNext,
}: PlaybackControlsNativeProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <TouchableOpacity
        onPress={onPlayPause}
        disabled={isLoading}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#2563eb",
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 18 }}>{isPlaying ? "❚❚" : "▶"}</Text>
        )}
      </TouchableOpacity>

      {onSkipNext && (
        <TouchableOpacity
          onPress={onSkipNext}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#d1d5db",
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Next track"
        >
          <Text style={{ fontSize: 14 }}>⏭</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
