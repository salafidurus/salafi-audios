import type { ReactNode } from "react";

import { MenuView, type MenuAction, type NativeActionEvent } from "@expo/ui/community/menu";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type ListItemProps = {
  children: ReactNode;
  onPress?: () => void;
  interactive?: boolean;
  hideBorder?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Actions shown in a native context menu opened by long-pressing the row. */
  actions?: MenuAction[];
  /** Called with the pressed action's `id` (falling back to its `title`). */
  onAction?: (id: string) => void;
  testID?: string;
};

export function ListItem({
  children,
  onPress,
  interactive = false,
  hideBorder = false,
  style,
  actions,
  onAction,
  testID,
}: ListItemProps) {
  const isClickable = Boolean(onPress);
  const isInteractive = isClickable || interactive;

  const row = (
    <Pressable
      onPress={onPress}
      disabled={!isClickable}
      testID={testID}
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

  if (!actions?.length) return row;

  return (
    <MenuView
      testID={testID}
      actions={actions}
      shouldOpenOnLongPress
      onPressAction={(event: NativeActionEvent) => onAction?.(event.nativeEvent.event)}
    >
      {row}
    </MenuView>
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
