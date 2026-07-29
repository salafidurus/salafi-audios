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
};

export function UserAvatar({ image, name, size = 48, fill = false }: UserAvatarProps): ReactNode {
  const { theme } = useUnistyles();

  if (fill) {
    if (image) {
      return <Image source={{ uri: image }} style={styles.fillImage} contentFit="cover" />;
    }
    return (
      <View style={[styles.fillFallback, { backgroundColor: theme.colors.action.primary }]}>
        <AppText variant="titleMd" style={{ color: theme.colors.content.onPrimary }}>
          {name?.charAt(0)?.toUpperCase() ?? "?"}
        </AppText>
      </View>
    );
  }

  const avatarSize = size;
  const borderRadius = avatarSize / 2;

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: avatarSize, height: avatarSize, borderRadius }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius,
          backgroundColor: theme.colors.action.primary,
        },
      ]}
    >
      <AppText
        variant="bodyLg"
        style={{ color: theme.colors.content.onPrimary, fontSize: avatarSize * 0.4 }}
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
