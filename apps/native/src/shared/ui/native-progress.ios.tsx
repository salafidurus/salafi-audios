import { ProgressView } from "@expo/ui/swift-ui";
import { progressViewStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { useUnistyles } from "react-native-unistyles";

import type { NativeProgressProps } from "./native-progress.types";

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
