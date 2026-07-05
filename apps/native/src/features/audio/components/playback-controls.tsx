import React from "react";
import { View, Pressable, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../audio-service";
import { Play, Pause, RotateCw, RotateCcw } from "lucide-react-native";

export function PlaybackControls() {
  const { isPlaying, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();
  const { theme } = useUnistyles();

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

  const onPrimary = theme.colors.content.onPrimary;
  const strong = theme.colors.content.strong;
  const RotateCcwIcon = <RotateCcw size={28} color={strong} />;
  const PauseIcon = <Pause size={32} color={onPrimary} fill={onPrimary} />;
  const PlayIcon = <Play size={32} color={onPrimary} fill={onPrimary} />;
  const RotateCwIcon = <RotateCw size={28} color={strong} />;

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

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.scale.xl,
    marginVertical: theme.spacing.scale.lg,
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.scale["2xl"],
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
    color: theme.colors.content.strong,
    position: "absolute",
    top: 9,
  },
  speedButton: {
    paddingVertical: theme.spacing.component.chipY,
    paddingHorizontal: theme.spacing.scale.md,
    borderRadius: theme.radius.scale.lg,
    backgroundColor: theme.colors.surface.subtle,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.content.muted,
  },
  placeholder: {
    width: 60,
  },
}));
