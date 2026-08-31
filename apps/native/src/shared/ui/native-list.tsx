import type { ComponentProps, ReactNode } from "react";

import { List as ExpoList, ListItem as ExpoListItem } from "@expo/ui";

import { ListContainer, type ListContainerProps } from "./native-list-container";
import { ListItem, type ListItemProps } from "./native-list-item";
import { ListItemActions, type ListItemActionsProps } from "./native-list-item-actions";
import { ListItemText } from "./native-list-item-text";
import { NativeText } from "./native-text";

/**
 * Provides the canonical compound list API, keeping row actions and text attached to each item.
 * The implementation delegates layout and row behavior to the migrated list primitives so feature
 * callers cannot accidentally reintroduce the removed legacy component boundary.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the compound declaration is documented above.
export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
    Text: ListItemText,
  }),
});

export { ListContainer, ListItem, ListItemActions, ListItemText };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };

/** Exposes real Expo UI list composition; vertical layout belongs elsewhere. */
/** Props retain the native list semantics supplied by Expo UI. */
export type NativeListProps = ComponentProps<typeof ExpoList>;

/** Preserves Expo UI List composition for callers. */
export function NativeList(props: NativeListProps) {
  return <ExpoList {...props} />;
}

/** Defines the semantic content and activation contract of one native row. */
/** Title, supporting content, and native row props exposed to feature callers. */
export type NativeListItemProps = Omit<ComponentProps<typeof ExpoListItem>, "children"> & {
  title: string;
  supportingText?: string;
  leading?: ReactNode;
};

/** Renders a token-aware row while preserving native activation behavior. */
export function NativeListItem({ title, supportingText, leading, ...props }: NativeListItemProps) {
  return (
    <ExpoListItem
      {...props}
      leading={leading}
      supportingText={
        supportingText ? <NativeText colorRole="muted">{supportingText}</NativeText> : undefined
      }
    >
      <NativeText colorRole="strong">{title}</NativeText>
    </ExpoListItem>
  );
}
