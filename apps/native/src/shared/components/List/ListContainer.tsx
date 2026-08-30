import type { ReactNode } from "react";

import { List as ExpoList } from "@expo/ui";

/** Defines the content contract for an Expo UI list. */
/** Container background, spacing, borders, and platform presentation remain native-owned. */
export type ListContainerProps = {
  children: ReactNode;
};

/** Defines the native list container contract used by this module. */
export function ListContainer({ children }: ListContainerProps) {
  return <ExpoList>{children}</ExpoList>;
}
