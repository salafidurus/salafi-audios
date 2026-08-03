import { CircularProgressIndicator, LinearProgressIndicator } from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useUnistyles } from "react-native-unistyles";

import type { NativeProgressProps } from "./native-progress.types";

export function NativeProgress({ value, variant = "circular", testID }: NativeProgressProps) {
  const { theme } = useUnistyles();
  const props = {
    progress: value,
    color: theme.colors.action.primary,
    trackColor: theme.colors.surface.subtle,
    modifiers: testID ? [testIDModifier(testID)] : undefined,
  };

  return variant === "linear" ? (
    <LinearProgressIndicator {...props} />
  ) : (
    <CircularProgressIndicator {...props} />
  );
}

export type { NativeProgressProps } from "./native-progress.types";
