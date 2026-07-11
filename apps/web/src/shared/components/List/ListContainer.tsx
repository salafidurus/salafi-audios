import type { ReactNode } from "react";
import styles from "./list-container.module.css";

export type ListContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Container for list items following the /explore screen pattern.
 * Wraps items in a bordered, rounded container with surface-default background.
 * Items inside should be transparent with no borders.
 */
export function ListContainer({ children, className }: ListContainerProps) {
  return <div className={`${styles.container} ${className ?? ""}`}>{children}</div>;
}
