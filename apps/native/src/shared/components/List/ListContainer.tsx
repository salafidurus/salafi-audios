import type { ReactNode } from "react";

import { Host, List as ExpoList } from "@expo/ui";

/** Defines the content contract for an Expo UI list. */
/** Container background, spacing, borders, and platform presentation remain native-owned. */
export type ListContainerProps = {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  testID?: string;
};

/** Defines the native list container contract used by this module. */
export function ListContainer({ children, onRefresh, testID = "native-list" }: ListContainerProps) {
  return (
    <Host style={{ flex: 1 }}>
      <ExpoList onRefresh={onRefresh} testID={testID}>
        {children}
      </ExpoList>
    </Host>
  );
}
