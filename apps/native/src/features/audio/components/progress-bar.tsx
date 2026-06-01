import React, { useRef } from "react";
import { View, StyleSheet, Pressable, GestureResponderEvent } from "react-native";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";

export function ProgressBar() {
  const { durationSeconds, progressPercent } = useAudio();
  const progressBarRef = useRef<View>(null);

  const handlePress = (event: GestureResponderEvent) => {
    if (durationSeconds <= 0) return;

    const locationX = event.nativeEvent.locationX;
    progressBarRef.current?.measure((_x, _y, width) => {
      const clickRatio = Math.min(Math.max(locationX / width, 0), 1);
      const targetSeconds = clickRatio * durationSeconds;
      audioService.seek(targetSeconds);
    });
  };

  return (
    <Pressable onPress={handlePress} accessibilityLabel="Audio progress bar">
      <View ref={progressBarRef} style={styles.container} collapsable={false}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
          <View style={[styles.knob, { start: `${progressPercent}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "100%",
  },
  track: {
    height: 4,
    width: "100%",
    backgroundColor: "#E2E8F0", // design token placeholder
    borderRadius: 2,
    position: "relative",
  },
  fill: {
    height: "100%",
    backgroundColor: "#3B82F6", // primary color token
    borderRadius: 2,
  },
  knob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    position: "absolute",
    top: -4,
    marginStart: -6,
  },
});
