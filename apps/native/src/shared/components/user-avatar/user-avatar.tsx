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

export function UserAvatar({
  image,
  name,
  size = 48,
  fill = false,
  testID,
}: UserAvatarProps): ReactNode {
  const { theme } = useUnistyles();
  const borderRadius = theme.radius.component.panelSm ?? theme.radius.scale.sm ?? 8;

  if (fill) {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={[styles.fillImage, { borderRadius }]}
          contentFit="cover"
          testID={testID}
        />
      );
    }
    return (
      <View
        style={[
          styles.fillFallback,
          { backgroundColor: theme.colors.surface.subtle, borderRadius },
        ]}
        testID={testID}
      >
        <AppText variant="titleMd" style={{ color: theme.colors.content.muted }}>
          {name?.charAt(0)?.toUpperCase() ?? "?"}
        </AppText>
      </View>
    );
  }

  const avatarSize = size;

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: avatarSize, height: avatarSize, borderRadius }}
        contentFit="cover"
        testID={testID}
      />
    );
  }

  return (
    <View
      testID={testID}
      style={[
        styles.fallback,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius,
          backgroundColor: theme.colors.surface.subtle,
        },
      ]}
    >
      <AppText
        variant="bodyLg"
        style={{ color: theme.colors.content.muted, fontSize: avatarSize * 0.4 }}
      >
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </AppText>
    </View>
  );
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
