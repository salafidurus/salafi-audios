import type { ComponentProps } from "react";

import { RNHostView, type RNHostViewProps } from "@expo/ui";
import { Image } from "expo-image";

export type NativeImageProps = ComponentProps<typeof Image> & {
  bridgeStyle?: RNHostViewProps["style"];
  matchContents?: boolean;
};

export function NativeImage({
  bridgeStyle,
  matchContents = false,
  ...imageProps
}: NativeImageProps) {
  return (
    <RNHostView matchContents={matchContents} style={bridgeStyle}>
      <Image {...imageProps} />
    </RNHostView>
  );
}
