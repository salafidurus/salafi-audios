import { Button, Column, Row } from "@expo/ui";
import { useAudio, useQueue } from "@sd/domain-audio";
import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { toUniversalStyleFromRN } from "@/core/styles/expo-ui";
import { NativeIcon, NativeText } from "@/shared/ui";

import { audioService } from "../audio-service";

/** Defines the native playback control contract used by this module. */

function handlePrevious() {
  audioService.skipToPrevious();
}

/** Renders native playback actions while preserving the audio service contract. */
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

  if (!hasTrack) return null;

  return (
    <Column
      alignment="center"
      spacing={theme.spacing.scale.md}
      style={toUniversalStyleFromRN(styles.container)}
    >
      <Button
        onPress={handleCycleSpeed}
        variant="text"
        label={`${speed.toFixed(2)}x`}
        testID="playback-speed"
        style={toUniversalStyleFromRN(styles.speedButton)}
      />

      <Row alignment="center" spacing={theme.spacing.scale.sm}>
        <Button
          variant="text"
          onPress={handlePrevious}
          testID="previous-track"
          style={toUniversalStyleFromRN(styles.iconButton)}
        >
          <NativeIcon name="skipBack" size={20} colorRole="strong" />
        </Button>

        <Button
          variant="text"
          onPress={handleSkipBackward}
          testID="skip-backward"
          style={toUniversalStyleFromRN(styles.iconButton)}
        >
          <Column alignment="center">
            <NativeIcon name="replay" size={28} colorRole="strong" />
            <NativeText variant="caption" colorRole="strong" textStyle={{ fontSize: 9 }}>
              30
            </NativeText>
          </Column>
        </Button>

        <Button
          variant="text"
          onPress={handlePlayPause}
          testID="play-pause"
          style={toUniversalStyleFromRN(styles.playButton)}
        >
          <NativeIcon name={isPlaying ? "pause" : "play"} size={30} colorRole="onAction" />
        </Button>

        <Button
          variant="text"
          onPress={handleSkipForward}
          testID="skip-forward"
          style={toUniversalStyleFromRN(styles.iconButton)}
        >
          <Column alignment="center">
            <NativeIcon name="forward" size={28} colorRole="strong" />
            <NativeText variant="caption" colorRole="strong" textStyle={{ fontSize: 9 }}>
              30
            </NativeText>
          </Column>
        </Button>

        <Button
          variant="text"
          onPress={handleNext}
          disabled={!hasNext}
          testID="next-track"
          style={toUniversalStyleFromRN(styles.iconButton)}
        >
          <NativeIcon
            name="skipForward"
            size={20}
            color={hasNext ? theme.colors.content.strong : theme.colors.content.muted}
          />
        </Button>
      </Row>
    </Column>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "stretch",
    marginVertical: theme.spacing.scale.md,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
    justifyContent: "center",
    alignment: "center",
  },
  iconButton: {
    width: 44,
    height: 52,
    justifyContent: "center",
    alignment: "center",
  },
  speedButton: {
    height: 40,
    borderRadius: theme.radius.scale.lg,
    backgroundColor: theme.colors.surface.subtle,
    width: 76,
    justifyContent: "center",
    alignment: "center",
  },
}));
