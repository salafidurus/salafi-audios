import type { ReactNode } from "react";

import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeText as AppText } from "@/shared/ui";

/** Provides a reusable native UI primitive with a focused rendering contract. */
type UserAvatarProps = {
  image?: string | null;
  name?: string | null;
  size?: number;
  fill?: boolean;
  testID?: string;
};

type AvatarTheme = ReturnType<typeof useUnistyles>["theme"];

function renderImage(
  size: number,
  fill: boolean,
  borderRadius: number,
  image: string,
  testID?: string,
): ReactNode {
  return (
    <Image
      source={{ uri: image }}
      style={
        fill ? [styles.fillImage, { borderRadius }] : { width: size, height: size, borderRadius }
      }
      contentFit="cover"
      testID={testID}
    />
  );
}

function renderFallback(
  name: string | null | undefined,
  size: number,
  fill: boolean,
  borderRadius: number,
  theme: AvatarTheme,
  testID?: string,
): ReactNode {
  const fallbackStyle = fill
    ? [styles.fillFallback, { backgroundColor: theme.colors.surface.subtle, borderRadius }]
    : [
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: theme.colors.surface.subtle,
        },
      ];
  const textStyle = fill
    ? { color: theme.colors.content.muted }
    : { color: theme.colors.content.muted, fontSize: size * 0.4 };

  return (
    <View testID={testID} style={fallbackStyle}>
      <AppText variant={fill ? "titleMd" : "bodyLg"} style={textStyle}>
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </AppText>
    </View>
  );
}

function renderAvatar(
  image: string | null | undefined,
  name: string | null | undefined,
  size: number,
  fill: boolean,
  borderRadius: number,
  theme: AvatarTheme,
  testID?: string,
): ReactNode {
  return image
    ? renderImage(size, fill, borderRadius, image, testID)
    : renderFallback(name, size, fill, borderRadius, theme, testID);
}

/** Renders the native user avatar surface and coordinates its user-facing state. */
export function UserAvatar({
  image,
  name,
  size = 48,
  fill = false,
  testID,
}: UserAvatarProps): ReactNode {
  const { theme } = useUnistyles();
  const borderRadius = theme.radius.component.panelSm ?? theme.radius.scale.sm ?? 8;

  return renderAvatar(image, name, size, fill, borderRadius, theme, testID);
}

const styles = StyleSheet.create(() => ({
  fillImage: {
    width: "100%",
    height: "100%",
  },
  fillFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
  },
}));
