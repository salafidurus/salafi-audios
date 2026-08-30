import type { ReactElement, ReactNode } from "react";

import { ListItem as ExpoListItem } from "@expo/ui";
import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement, useState } from "react";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Describes the inputs and callbacks accepted by List Item. */
/** Describes the inputs, callbacks, and optional state accepted by List Item. */
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

/** Renders the native list item surface and coordinates its user-facing state. */
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
  const [pressed, setPressed] = useState(false);

  const elements = Children.toArray(children);
  const actionsElement = elements.find(isActionsElement);
  const content = elements.filter((child) => child !== actionsElement);

  const row = (
    <Pressable
      onPressIn={isInteractive ? () => setPressed(true) : undefined}
      onPressOut={isInteractive ? () => setPressed(false) : undefined}
      testID={testID}
      style={() => [
        styles.item,
        hideBorder && styles.noBorder,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
    >
      <ExpoListItem onPress={onPress} testID="native-list-item">
        {content}
      </ExpoListItem>
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
