import type { ReactNode } from "react";
import styles from "./ListItemActions.module.css";

export type ListItemActionsProps = {
  /** Action buttons or any interactive elements */
  children?: ReactNode;
  /** Optional custom className to merge with default styles */
  className?: string;
  /** Controls action stacking on desktop/tablet: 'horizontal' (default) for row layout, 'vertical' for column */
  orientation?: "horizontal" | "vertical";
  /** Controls action stacking on mobile: 'horizontal' (default) for row layout, 'vertical' for column */
  mobileOrientation?: "horizontal" | "vertical";
};

/**
 * List.Item.Actions — standardized action button container for list items.
 *
 * - Desktop/Tablet: actions positioned on the right side, flexible orientation (horizontal/vertical)
 * - Mobile: actions positioned below content (full width), flexible orientation (horizontal/vertical)
 * - No divider separator between content and actions
 * - Supports independent orientation control per breakpoint via orientation and mobileOrientation props
 *
 * Usage:
 * ```tsx
 * <List.Item>
 *   <ItemContent />
 *   <List.Item.Actions orientation="horizontal" mobileOrientation="vertical">
 *     <Button>Edit</Button>
 *     <Button>Delete</Button>
 *   </List.Item.Actions>
 * </List.Item>
 * ```
 */
export function ListItemActions({
  children,
  className,
  orientation = "horizontal",
  mobileOrientation = "horizontal",
}: ListItemActionsProps) {
  return (
    <div
      data-testid="list-item-actions"
      className={`${styles.actions} ${styles[`orientation-${orientation}`]} ${styles[`mobile-orientation-${mobileOrientation}`]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
