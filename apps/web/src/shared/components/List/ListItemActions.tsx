import type { ReactNode } from "react";
import styles from "./ListItemActions.module.css";

export type ListItemActionsProps = {
  /** Action buttons or any interactive elements */
  children?: ReactNode;
  /** Optional custom className to merge with default styles */
  className?: string;
  /** Controls action stacking on desktop/tablet: 'horizontal' (default) for row layout, 'vertical' for column */
  orientation?: "horizontal" | "vertical";
  /** Controls action stacking on mobile: 'vertical' (default) for column layout */
  mobileOrientation?: "horizontal" | "vertical";
  /** Fixed width percentage for actions on desktop/tablet (e.g. '10%', '20%'). Default: '10%'. Mobile is 100% */
  widthPercentDesktop?: string;
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
  mobileOrientation = "vertical",
  widthPercentDesktop = "10%",
}: ListItemActionsProps) {
  return (
    <div
      data-testid="list-item-actions"
      className={`${styles.actions} ${styles[`orientation-${orientation}`]} ${styles[`mobile-orientation-${mobileOrientation}`]} ${className ?? ""}`}
      style={{ "--actions-width-desktop": widthPercentDesktop } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
