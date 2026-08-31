import { Button as ExpoButton, Host, Text as ExpoText } from "@expo/ui";
import { useAudio, useQueue } from "@sd/domain-audio";
import { Play, Pause, RotateCw, RotateCcw, SkipBack, SkipForward } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
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
        <Host matchContents>
          <ExpoButton onPress={handleCycleSpeed} variant="text" testID="playback-speed">
            <ExpoText
              textStyle={{ fontSize: 12, fontWeight: "bold", color: muted }}
            >{`${speed.toFixed(2)}x`}</ExpoText>
          </ExpoButton>
        </Host>
      </View>

      <View style={styles.centerControls}>
        <View accessible accessibilityLabel="Previous track">
          <Host matchContents>
            <ExpoButton onPress={handlePrevious} variant="text" testID="previous-track">
              <SkipBack size={20} color={strong} fill={strong} />
            </ExpoButton>
          </Host>
        </View>

        <View accessible accessibilityLabel="Skip backward 30 seconds">
          <Host matchContents>
            <ExpoButton onPress={handleSkipBackward} variant="text" testID="skip-backward">
              {RotateCcwIcon}
              <ExpoText textStyle={styles.skipText}>30</ExpoText>
            </ExpoButton>
          </Host>
        </View>

        <View accessible accessibilityLabel={isPlaying ? "Pause" : "Play"}>
          <Host matchContents>
            <ExpoButton onPress={handlePlayPause} style={styles.playButton} testID="play-pause">
              {isPlaying ? PauseIcon : <View style={{ marginStart: 4 }}>{PlayIcon}</View>}
            </ExpoButton>
          </Host>
        </View>

        <View accessible accessibilityLabel="Skip forward 30 seconds">
          <Host matchContents>
            <ExpoButton onPress={handleSkipForward} variant="text" testID="skip-forward">
              {RotateCwIcon}
              <ExpoText textStyle={styles.skipText}>30</ExpoText>
            </ExpoButton>
          </Host>
        </View>

        <View accessible accessibilityLabel="Next track">
          <Host matchContents>
            <ExpoButton onPress={handleNext} disabled={!hasNext} variant="text" testID="next-track">
              <SkipForward
                size={20}
                color={hasNext ? strong : muted}
                fill={hasNext ? strong : muted}
              />
            </ExpoButton>
          </Host>
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
