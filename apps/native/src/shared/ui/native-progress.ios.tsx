import { ProgressView } from "@expo/ui/swift-ui";
import { progressViewStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { useUnistyles } from "react-native-unistyles";

import type { NativeProgressProps } from "./native-progress.types";

/** Renders progress with SwiftUI's platform-native indicator contract. */
/** Maps the shared progress contract to SwiftUI modifiers and token color. */
export function NativeProgress({ value, variant = "circular", testID }: NativeProgressProps) {
  const { theme } = useUnistyles();
  return (
    <ProgressView
      value={value}
      testID={testID}
      modifiers={[progressViewStyle(variant), tint(theme.colors.action.primary)]}
    />
  );
}

export type { NativeProgressProps } from "./native-progress.types";
