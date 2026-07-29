import type { ReactNode } from "react";

import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type ListItemProps = {
  children: ReactNode;
  onPress?: () => void;
  interactive?: boolean;
  hideBorder?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ListItem({
  children,
  onPress,
  interactive = false,
  hideBorder = false,
  style,
}: ListItemProps) {
  const isClickable = Boolean(onPress);
  const isInteractive = isClickable || interactive;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isClickable}
      style={({ pressed }) => [
        styles.item,
        hideBorder && styles.noBorder,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    backgroundColor: "transparent",
    paddingVertical: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.lg,
    borderBottomWidth: theme.border.width.default,
    borderBottomColor: theme.colors.border.subtle,
    flexDirection: "column",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  pressed: {
    backgroundColor: theme.colors.surface.hover,
  },
}));
