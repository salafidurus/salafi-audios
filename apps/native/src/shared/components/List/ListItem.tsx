import type { ReactElement, ReactNode } from "react";

import { Column, RNHostView } from "@expo/ui";
import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

export type ListItemProps = {
  children: ReactNode;
  onPress?: () => void;
  interactive?: boolean;
  hideBorder?: boolean;
  testID?: string;
};

function isActionsElement(child: ReactNode): child is ReactElement<ListItemActionsProps> {
  return isValidElement(child) && child.type === ListItemActions;
}

export function ListItem({ children, hideBorder = false, testID }: ListItemProps) {
  const { theme } = useUnistyles();
  const elements = Children.toArray(children);
  const actionsElement = elements.find(isActionsElement);
  const content = elements.filter((child) => child !== actionsElement);

  const row = (
    <Column
      testID={testID}
      spacing={theme.spacing.component.gapSm}
      style={Object.assign({}, styles.item, hideBorder ? styles.noBorder : undefined)}
    >
      {content}
    </Column>
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
      <RNHostView>{row}</RNHostView>
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
  },
  noBorder: {
    borderBottomWidth: 0,
  },
}));
