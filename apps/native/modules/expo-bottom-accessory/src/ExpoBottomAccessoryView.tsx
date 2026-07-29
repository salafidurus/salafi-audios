import type { ViewProps } from "react-native";

import { requireNativeView } from "expo";
import React from "react";

export type ExpoBottomAccessoryViewProps = ViewProps & {
  offsetPadding?: number;
  animationEnabled?: boolean;
  elevation?: number;
  visible?: boolean;
};

const NativeView: React.ComponentType<ExpoBottomAccessoryViewProps> =
  requireNativeView("ExpoBottomAccessory");

export function ExpoBottomAccessoryView(props: ExpoBottomAccessoryViewProps) {
  return <NativeView {...props} />;
}
