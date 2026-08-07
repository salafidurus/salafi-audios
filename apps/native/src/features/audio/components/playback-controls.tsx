import { useAudio, useQueue } from "@sd/domain-audio";
import {
  Bookmark,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { audioService } from "../audio-service";

export function PlaybackControls() {
  const { isPlaying, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();
  const { hasNext, hasPrevious } = useQueue();
  const { theme } = useUnistyles();
  const [saved, setSaved] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  const handlePrevious = () => {
    if (!hasPrevious) return;
    audioService.skipToPrevious();
  };

  const handleNext = () => {
    if (!hasNext) return;
    audioService.skipToNext();
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
  const muted = theme.colors.content.muted;
  const RotateCcwIcon = <RotateCcw size={24} color={strong} />;
  const PauseIcon = <Pause size={24} color={onPrimary} fill={onPrimary} />;
  const PlayIcon = <Play size={24} color={onPrimary} fill={onPrimary} />;
  const RotateCwIcon = <RotateCw size={24} color={strong} />;

  if (!hasTrack) return null;

  return (
    <View style={styles.container}>
      <Pressable onPress={handleCycleSpeed} style={styles.speedButton}>
        <Text style={styles.speedText}>{speed.toFixed(1)}x</Text>
      </Pressable>

      <View style={styles.centerControls}>
        <Pressable
          onPress={handlePrevious}
          disabled={!hasPrevious}
          style={styles.trackButton}
          accessibilityLabel="Previous track"
        >
          <SkipBack
            size={20}
            color={hasPrevious ? strong : muted}
            fill={hasPrevious ? strong : muted}
          />
        </Pressable>

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

        <Pressable
          onPress={handleNext}
          disabled={!hasNext}
          style={styles.trackButton}
          accessibilityLabel="Next track"
        >
          <SkipForward size={20} color={hasNext ? strong : muted} fill={hasNext ? strong : muted} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => setSaved((v) => !v)}
        style={styles.bookmarkButton}
        accessibilityLabel="Bookmark"
      >
        <Bookmark
          size={16}
          color={saved ? theme.colors.action.primary : theme.colors.content.subtle}
          fill={saved ? theme.colors.action.primary : "none"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.scale.md,
    marginVertical: theme.spacing.scale.lg,
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  speedButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.scale.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.content.subtle,
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: theme.spacing.scale.xs,
  },
  trackButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.scale.xs,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.scale.sm,
  },
  skipLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: theme.colors.content.strong,
    position: "absolute",
    bottom: 4,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.scale.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    justifyContent: "center",
    alignItems: "center",
  },
}));
