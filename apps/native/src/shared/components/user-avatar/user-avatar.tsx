import type { ReactNode } from "react";

import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

type UserAvatarProps = {
  image?: string | null;
  name?: string | null;
  size?: number;
  fill?: boolean;
  testID?: string;
};

type AvatarTheme = ReturnType<typeof useUnistyles>["theme"];

function renderAvatar(
  image: string | null | undefined,
  name: string | null | undefined,
  size: number,
  fill: boolean,
  borderRadius: number,
  theme: AvatarTheme,
  testID?: string,
): ReactNode {
  if (image) {
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
  return (
    <View
      testID={testID}
      style={[
        fill ? styles.fillFallback : styles.fallback,
        fill
          ? { backgroundColor: theme.colors.surface.subtle, borderRadius }
          : {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: theme.colors.surface.subtle,
            },
      ]}
    >
      <AppText
        variant={fill ? "titleMd" : "bodyLg"}
        style={
          fill
            ? { color: theme.colors.content.muted }
            : { color: theme.colors.content.muted, fontSize: size * 0.4 }
        }
      >
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </AppText>
    </View>
  );
}

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
