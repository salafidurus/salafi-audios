import type { ReactElement, ReactNode } from "react";

import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement } from "react";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Describes the ListItemProps native contract and behavior. */
/** Describes the ListItemProps native type contract and behavior. */
export type ListItemProps = {
  children: ReactNode;
  onPress?: () => void;
  interactive?: boolean;
  hideBorder?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function isActionsElement(child: ReactNode): child is ReactElement<ListItemActionsProps> {
  return isValidElement(child) && child.type === ListItemActions;
}

/** Describes the ListItem native contract and behavior. */
export function ListItem({
  children,
  onPress,
  interactive = false,
  hideBorder = false,
  style,
  testID,
}: ListItemProps) {
  const isClickable = Boolean(onPress);
  const isInteractive = isClickable || interactive;

  const elements = Children.toArray(children);
  const actionsElement = elements.find(isActionsElement);
  const content = elements.filter((child) => child !== actionsElement);

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
      {content}
    </Pressable>
  );

  if (!actionsElement) return row;

  const { actions, onAction } = actionsElement.props;

  return (
    <MenuView
      testID={testID}
      actions={actions}
      shouldOpenOnLongPress
      onPressAction={(event: NativeActionEvent) => onAction(event.nativeEvent.event)}
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
