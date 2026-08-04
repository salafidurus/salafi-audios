import type { ReactNode } from "react";

import { List, ListItem, type ListProps, type ListItemProps } from "@expo/ui";

import type { NativeIconName } from "./native-icon-sources";

import { NativeIcon } from "./native-icon";
import { NativeText } from "./native-text";

export type NativeListProps = ListProps;

export function NativeList(props: NativeListProps) {
  return <List {...props} />;
}

export type NativeListItemProps = Omit<ListItemProps, "children" | "leading" | "supportingText"> & {
  title: string;
  supportingText?: string;
  leadingIcon?: NativeIconName;
  leading?: ReactNode;
};

export function NativeListItem({
  title,
  supportingText,
  leadingIcon,
  leading,
  ...props
}: NativeListItemProps) {
  const leadingContent = leading ?? (leadingIcon ? <NativeIcon name={leadingIcon} /> : undefined);

  return (
    <ListItem
      {...props}
      leading={leadingContent}
      supportingText={
        supportingText ? (
          <NativeText variant="bodySm" colorRole="muted">
            {supportingText}
          </NativeText>
        ) : undefined
      }
    >
      <NativeText variant="bodyMd" colorRole="strong">
        {title}
      </NativeText>
    </ListItem>
  );
}
