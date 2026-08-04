import type { ReactNode } from "react";

import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { NativeImage } from "@/shared/ui/native-image";
import { NativeText } from "@/shared/ui/native-text";

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
        <NativeImage
          source={{ uri: image }}
          bridgeStyle={{ borderRadius }}
          style={{ flex: 1, borderRadius }}
          contentFit="cover"
          testID={testID}
        />
      );
    }
    return (
      <Column
        alignment="center"
        testID={testID}
        style={{
          backgroundColor: theme.colors.surface.subtle,
          borderRadius,
        }}
      >
        <NativeText variant="titleMd" colorRole="muted">
          {name?.charAt(0)?.toUpperCase() ?? "?"}
        </NativeText>
      </Column>
    );
  }

  const avatarSize = size;

  if (image) {
    return (
      <NativeImage
        source={{ uri: image }}
        bridgeStyle={{ width: avatarSize, height: avatarSize, borderRadius }}
        style={{ width: avatarSize, height: avatarSize, borderRadius }}
        contentFit="cover"
        testID={testID}
      />
    );
  }

  return (
    <Column
      testID={testID}
      alignment="center"
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius,
        backgroundColor: theme.colors.surface.subtle,
      }}
    >
      <NativeText variant="bodyLg" colorRole="muted">
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </NativeText>
    </Column>
  );
}
