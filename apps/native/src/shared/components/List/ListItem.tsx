import type { ReactElement, ReactNode } from "react";

import { ListItem as ExpoListItem, RNHostView } from "@expo/ui";
import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { Children, isValidElement } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";

import { NativeText } from "@/shared/ui";

import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Defines the content and interaction contract for an Expo UI list row. */
/** Row layout, separators, pressed feedback, and platform-specific styling remain native-owned. */
export type ListItemProps = {
  children: ReactNode;
  title?: string;
  leading?: ReactNode;
  supportingText?: string | ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
};

function isActionsElement(child: ReactNode): child is ReactElement<ListItemActionsProps> {
  return isValidElement(child) && child.type === ListItemActions;
}

function hostContent(node: ReactNode) {
  if (node == null || !isValidElement(node)) return node;
  return (
    <RNHostView>
      <>{node}</>
    </RNHostView>
  );
}

function renderActions(
  actionsElement: ReactElement<ListItemActionsProps> | undefined,
  testID: string | undefined,
) {
  if (!actionsElement) return null;
  const { actions, onAction } = actionsElement.props;
  return (
    <RNHostView matchContents style={{ width: 48, height: 48 }}>
      <MenuView
        testID={testID ? `${testID}-actions` : undefined}
        actions={actions}
        shouldOpenOnLongPress
        onPressAction={(event: NativeActionEvent) => onAction(event.nativeEvent.event)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More actions"
          style={{ width: 48, height: 48, justifyContent: "center", alignItems: "center" }}
        >
          <Text>•••</Text>
        </Pressable>
      </MenuView>
    </RNHostView>
  );
}

function renderRnFallback(
  elements: ReactNode[],
  actionsElement: ReactElement<ListItemActionsProps> | undefined,
  onPress: (() => void) | undefined,
  testID: string | undefined,
) {
  const androidActions = Platform.OS === "android" && actionsElement?.props;
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
      <View style={styles.content}>{elements.filter((child) => child !== actionsElement)}</View>
    </Pressable>
  );

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

function renderHeadline(
  title: string | undefined,
  elements: ReactNode[],
  actionsElement: ReactElement<ListItemActionsProps> | undefined,
) {
  if (title && Platform.OS === "android") return title;
  if (title) return <NativeText colorRole="strong">{title}</NativeText>;
  return (
    <RNHostView style={{ width: "100%" }}>
      <>{elements.filter((child) => child !== actionsElement)}</>
    </RNHostView>
  );
}

function renderNativeItem({
  title,
  leading,
  supportingText,
  trailing,
  onPress,
  testID,
  elements,
  actionsElement,
}: ListItemProps & {
  elements: ReactNode[];
  actionsElement: ReactElement<ListItemActionsProps> | undefined;
}) {
  const actionMenu = renderActions(actionsElement, testID);
  const trailingContent = actionMenu ? (
    <>
      {trailing}
      {actionMenu}
    </>
  ) : (
    hostContent(trailing)
  );

  return (
    <ExpoListItem
      onPress={onPress}
      testID={testID}
      leading={hostContent(leading)}
      supportingText={hostContent(supportingText)}
      trailing={trailingContent}
    >
      {renderHeadline(title, elements, actionsElement)}
    </ExpoListItem>
  );
}

/** Renders the native list item surface and coordinates its user-facing state. */
export function ListItem({
  children,
  title,
  leading,
  supportingText,
  trailing,
  onPress,
  testID,
}: ListItemProps) {
  const elements = Children.toArray(children);
  const actionsElement = elements.find(isActionsElement);
  if (!title && leading == null && supportingText == null && trailing == null) {
    return renderRnFallback(elements, actionsElement, onPress, testID);
  }
  return renderNativeItem({
    title,
    leading,
    supportingText,
    trailing,
    onPress,
    testID,
    children,
    elements,
    actionsElement,
  });
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
