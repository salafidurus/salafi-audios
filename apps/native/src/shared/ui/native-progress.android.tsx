import {
  CircularProgressIndicator,
  LinearProgressIndicator,
  RNHostView,
} from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useUnistyles } from "react-native-unistyles";

import type { NativeProgressProps } from "./native-progress.types";

/** Renders progress with Compose's platform-native indicator contract. */
export function NativeProgress({ value, variant = "circular", testID }: NativeProgressProps) {
  const { theme } = useUnistyles();
  const props = {
    progress: value,
    color: theme.colors.action.primary,
    trackColor: theme.colors.surface.subtle,
    modifiers: testID ? [testIDModifier(testID)] : undefined,
  };
  return (
    <RNHostView>
      {variant === "linear" ? (
        <LinearProgressIndicator {...props} />
      ) : (
        <CircularProgressIndicator {...props} />
      )}
    </RNHostView>
  );
}

export type { NativeProgressProps } from "./native-progress.types";
