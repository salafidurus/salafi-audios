import type { ReactElement, ReactNode } from "react";

import { ListItem as ExpoListItem } from "@expo/ui";
import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement } from "react";

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

  const row = (
    <ExpoListItem onPress={onPress} testID={testID}>
      {content}
    </ExpoListItem>
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
