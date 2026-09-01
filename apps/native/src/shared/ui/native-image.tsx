import type { ComponentProps } from "react";

import { RNHostView, type RNHostViewProps } from "@expo/ui";
import { Image } from "expo-image";

/** Bridges the RN-owned remote-image capability into an Expo UI subtree. */
/** Image properties plus the explicit bridge sizing contract. */
export type NativeImageProps = ComponentProps<typeof Image> & {
  bridgeStyle?: RNHostViewProps["style"];
  matchContents?: boolean;
};

/** Uses RNHostView only for the explicit remote-image bridge direction. */
export function NativeImage({ bridgeStyle, matchContents = false, ...props }: NativeImageProps) {
  return (
    <RNHostView matchContents={matchContents} style={bridgeStyle}>
      <Image {...props} />
    </RNHostView>
  );
}
