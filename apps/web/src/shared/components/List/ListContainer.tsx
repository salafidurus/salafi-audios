/** Provides the shared bordered surface used to group related list items. */
import type { ReactNode } from "react";

import styles from "./list-container.module.css";

/** Defines the content and optional styling override for the shared list surface. */
type ListContainerProps = {
  children: ReactNode;
  className?: string;
};

export type { ListContainerProps };

/**
 * Container for list items following the /explore screen pattern.
 * Wraps items in a bordered, rounded container with surface-default background.
 * Items inside should be transparent with no borders.
 */
export function ListContainer({ children, className }: ListContainerProps) {
  return <div className={`${styles.container} ${className ?? ""}`}>{children}</div>;
}
