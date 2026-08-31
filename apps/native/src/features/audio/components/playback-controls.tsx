import { useAudio, useQueue } from "@sd/domain-audio";
import { Play, Pause, RotateCw, RotateCcw, SkipBack, SkipForward } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { audioService } from "../audio-service";

/** Adapts the platform audio engine to the native playback contract and lifecycle. */
function handlePrevious() {
  audioService.skipToPrevious();
}

/** Defines the native playback controls contract used by this module. */
export function PlaybackControls() {
  const { isPlaying, speed, positionSeconds, durationSeconds, hasTrack } = useAudio();
  const { hasNext } = useQueue();
  const { theme } = useUnistyles();

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
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
  const RotateCcwIcon = <RotateCcw size={28} color={strong} />;
  const PauseIcon = <Pause size={32} color={onPrimary} fill={onPrimary} />;
  const PlayIcon = <Play size={32} color={onPrimary} fill={onPrimary} />;
  const RotateCwIcon = <RotateCw size={28} color={strong} />;

  if (!hasTrack) return null;

  return (
    <View style={styles.container}>
      <View accessible accessibilityLabel="Playback speed">
        <Pressable onPress={handleCycleSpeed} testID="playback-speed">
          <Text
            style={{ fontSize: 12, fontWeight: "bold", color: muted }}
          >{`${speed.toFixed(2)}x`}</Text>
        </Pressable>
      </View>

      <View style={styles.centerControls}>
        <View accessible accessibilityLabel="Previous track">
          <Pressable onPress={handlePrevious} testID="previous-track">
            <SkipBack size={20} color={strong} fill={strong} />
          </Pressable>
        </View>

        <View accessible accessibilityLabel="Skip backward 30 seconds">
          <Pressable onPress={handleSkipBackward} testID="skip-backward" style={styles.skipControl}>
            {RotateCcwIcon}
            <Text style={styles.skipText}>30</Text>
          </Pressable>
        </View>

        <View accessible accessibilityLabel={isPlaying ? "Pause" : "Play"}>
          <Pressable onPress={handlePlayPause} style={styles.playButton} testID="play-pause">
            {isPlaying ? PauseIcon : <View style={{ marginStart: 4 }}>{PlayIcon}</View>}
          </Pressable>
        </View>

        <View accessible accessibilityLabel="Skip forward 30 seconds">
          <Pressable onPress={handleSkipForward} testID="skip-forward" style={styles.skipControl}>
            {RotateCwIcon}
            <Text style={styles.skipText}>30</Text>
          </Pressable>
        </View>

        <View accessible accessibilityLabel="Next track">
          <Pressable onPress={handleNext} disabled={!hasNext} testID="next-track">
            <SkipForward
              size={20}
              color={hasNext ? strong : muted}
              fill={hasNext ? strong : muted}
            />
          </Pressable>
        </View>
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
  skipControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
    marginHorizontal: theme.spacing.scale["2xl"],
  },
  skipText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.content.strong,
  },
  placeholder: {
    width: 60,
  },
}));
