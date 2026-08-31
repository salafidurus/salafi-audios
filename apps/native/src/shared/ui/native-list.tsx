import type { ComponentProps, ReactNode } from "react";

import { List, ListItem } from "@expo/ui";

import { NativeText } from "./native-text";

/** Exposes real Expo UI list composition; vertical layout belongs elsewhere. */
/** Props retain the native list semantics supplied by Expo UI. */
export type NativeListProps = ComponentProps<typeof List>;

/** Preserves Expo UI List composition for callers. */
export function NativeList(props: NativeListProps) {
  return <List {...props} />;
}

/** Defines the semantic content and activation contract of one native row. */
/** Title, supporting content, and native row props exposed to feature callers. */
export type NativeListItemProps = Omit<ComponentProps<typeof ListItem>, "children"> & {
  title: string;
  supportingText?: string;
  leading?: ReactNode;
};

/** Renders a token-aware row while preserving native activation behavior. */
export function NativeListItem({ title, supportingText, leading, ...props }: NativeListItemProps) {
  return (
    <ListItem
      {...props}
      leading={leading}
      supportingText={
        supportingText ? <NativeText colorRole="muted">{supportingText}</NativeText> : undefined
      }
    >
      <NativeText colorRole="strong">{title}</NativeText>
    </ListItem>
  );
}
