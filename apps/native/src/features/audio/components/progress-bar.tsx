import { Slider } from "@expo/ui";
import { useAudio } from "@sd/domain-audio";
import React from "react";

import { audioService } from "../audio-service";

/** Provides the native audio progress control used by playback surfaces. */
/** Renders the native progress bar surface and coordinates its user-facing seek behavior. */
export function ProgressBar() {
  const { durationSeconds, positionSeconds } = useAudio();

  return (
    <Slider
      value={positionSeconds}
      onValueChange={(value) => audioService.seek(value)}
      min={0}
      max={durationSeconds > 0 ? durationSeconds : 1}
      disabled={durationSeconds <= 0}
      testID="audio-progress-bar"
    />
  );
}
