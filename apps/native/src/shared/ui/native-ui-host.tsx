import type { ReactNode } from "react";

import { Host, type UniversalHostProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { getNativeHostConfiguration } from "./native-host-configuration";

type NativeScreenHostProps = Omit<
  UniversalHostProps,
  "children" | "colorScheme" | "layoutDirection" | "matchContents" | "seedColor"
> & {
  children: ReactNode;
};

export function NativeScreenHost({ children, style, ...props }: NativeScreenHostProps) {
  const { theme } = useUnistyles();
  const configuration = getNativeHostConfiguration(theme);

  return (
    <Host
      key={`${theme.mode}-${theme.direction}`}
      {...configuration}
      {...props}
      matchContents={false}
      useViewportSizeMeasurement
      style={[{ flex: 1, backgroundColor: theme.colors.surface.canvas }, style]}
    >
      {children}
    </Host>
  );
}

type NativeBridgeHostProps = Omit<
  UniversalHostProps,
  "children" | "colorScheme" | "layoutDirection" | "seedColor"
> & {
  children: ReactNode;
};

export function NativeBridgeHost({
  children,
  matchContents = true,
  style,
  ...props
}: NativeBridgeHostProps) {
  const { theme } = useUnistyles();
  const configuration = getNativeHostConfiguration(theme);

  return (
    <Host
      key={`${theme.mode}-${theme.direction}`}
      {...configuration}
      {...props}
      matchContents={matchContents}
      style={style}
    >
      {children}
    </Host>
  );
}
