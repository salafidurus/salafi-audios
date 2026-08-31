import type { ReactElement, ReactNode } from "react";

import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement } from "react";
import { Alert, Platform, Pressable, View } from "react-native";

import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Defines the content and interaction contract for an Expo UI list row. */
/** Row layout, separators, pressed feedback, and platform-specific styling remain native-owned. */
export type ListItemProps = {
  children: ReactNode;
  onPress?: () => void;
  testID?: string;
};

function isActionsElement(child: ReactNode): child is ReactElement<ListItemActionsProps> {
  return isValidElement(child) && child.type === ListItemActions;
}

/** Renders the native list item surface and coordinates its user-facing state. */
export function ListItem({ children, onPress, testID }: ListItemProps) {
  const elements = Children.toArray(children);
  const actionsElement = elements.find(isActionsElement);
  const content = elements.filter((child) => child !== actionsElement);
  const androidActions =
    Platform.OS === "android" && actionsElement ? actionsElement.props : undefined;

  const row = (
    <Pressable
      onPress={onPress}
      onLongPress={
        androidActions
          ? () =>
              Alert.alert("Actions", undefined, [
                ...androidActions.actions.map((action) => ({
                  text: action.title,
                  style: action.attributes?.destructive
                    ? ("destructive" as const)
                    : ("default" as const),
                  onPress: () => androidActions.onAction(action.id ?? action.title),
                })),
                { text: "Cancel", style: "cancel" as const },
              ])
          : undefined
      }
      testID={testID}
      style={styles.row}
    >
      <View style={styles.content}>{content}</View>
    </Pressable>
  );

  // Android's Compose MenuView currently cannot host this React Native row
  // tree without dropping its painted children. Keep the row visible and
  // interactive there; retain native context menus on supported platforms.
  if (!actionsElement || Platform.OS === "android") return row;

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

const styles = {
  row: {
    width: "100%" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    width: "100%" as const,
  },
};
