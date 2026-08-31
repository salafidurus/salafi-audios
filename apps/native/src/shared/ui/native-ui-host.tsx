import type { ReactElement, ReactNode } from "react";

import { Host, RNHostView, type UniversalHostProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { getNativeHostConfiguration } from "./native-host-configuration";

/** Owns explicit screen and bridge host boundaries for native UI trees. */

type NativeScreenHostProps = Omit<
  UniversalHostProps,
  "children" | "colorScheme" | "layoutDirection" | "matchContents" | "seedColor"
> & { children: ReactNode };

/** Owns the full-screen Expo UI host at a migrated screen or feature root. */
export function NativeScreenHost({ children, style, ...props }: NativeScreenHostProps) {
  const { theme, rt } = useUnistyles();
  const configuration = getNativeHostConfiguration(theme, rt.themeName);

  return (
    <Host
      key={`${rt.themeName}-${theme.direction}`}
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
> & { children: ReactElement };

/** Owns an Expo UI host whose child is an explicitly bridged RN subtree. */
export function NativeBridgeHost({
  children,
  matchContents = true,
  style,
  ...props
}: NativeBridgeHostProps) {
  const { theme, rt } = useUnistyles();
  const configuration = getNativeHostConfiguration(theme, rt.themeName);

  return (
    <Host
      key={`${rt.themeName}-${theme.direction}`}
      {...configuration}
      {...props}
      matchContents={matchContents}
      style={style}
    >
      <RNHostView>{children}</RNHostView>
    </Host>
  );
}
