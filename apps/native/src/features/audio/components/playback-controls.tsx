import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { Play, Pause, RotateCw, RotateCcw } from "lucide-react-native";

export function PlaybackControls() {
  const { isPlaying, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  const handleSkipForward = () => {
    const target = Math.min(positionSeconds + 30, durationSeconds);
    audioService.seek(target);
  };

  const handleSkipBackward = () => {
    const target = Math.max(positionSeconds - 30, 0);
    audioService.seek(target);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    audioService.setSpeed(speeds[nextIndex]!);
  };

  const RotateCcwIcon = <RotateCcw size={28} color="#1E293B" />;
  const PauseIcon = <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />;
  const PlayIcon = <Play size={32} color="#FFFFFF" fill="#FFFFFF" />;
  const RotateCwIcon = <RotateCw size={28} color="#1E293B" />;

  if (!hasTrack) return null;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleCycleSpeed} style={styles.speedButton}>
        <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
      </Pressable>

      <View style={styles.centerControls}>
        <Pressable onPress={handleSkipBackward} style={styles.controlButton}>
          {RotateCcwIcon}
          <Text style={styles.skipLabel}>30</Text>
        </Pressable>

        <Pressable onPress={handlePlayPause} style={styles.playButton}>
          {isPlaying ? PauseIcon : <View style={{ marginStart: 4 }}>{PlayIcon}</View>}
        </Pressable>

        <Pressable onPress={handleSkipForward} style={styles.controlButton}>
          {RotateCwIcon}
          <Text style={styles.skipLabel}>30</Text>
        </Pressable>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6", // primary design token
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  skipLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    position: "absolute",
    top: 9,
  },
  speedButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F1F5F9", // light gray token
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748B",
  },
  placeholder: {
    width: 60,
  },
});
