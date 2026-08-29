/** Provides responsive action placement for the shared list-item composition. */
import type { CSSProperties, ReactNode } from "react";

import styles from "./ListItemActions.module.css";

/** Defines responsive placement and styling for actions rendered beside a list item. */
type ListItemActionsProps = {
  /** Action buttons or other interactive elements rendered in the action region. */
  children?: ReactNode;
  /** Optional class name merged with the component's responsive action styles. */
  className?: string;
  /** Desktop/tablet action arrangement; horizontal is the default row layout. */
  orientation?: "horizontal" | "vertical";
  /** Mobile action arrangement; vertical is the default column layout. */
  mobileOrientation?: "horizontal" | "vertical";
  /** Desktop/tablet action width, expressed as a CSS percentage or `auto`. */
  widthPercentDesktop?: string;
  /** Optional click handler attached to the actions container. */
  onClick?: (e: React.MouseEvent) => void;
};

export type { ListItemActionsProps };

type ActionsStyleVars = CSSProperties & {
  "--actions-width-desktop": string;
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
  widthPercentDesktop = "auto",
}: ListItemActionsProps) {
  return (
    <div
      data-testid="list-item-actions"
      className={`${styles.actions} ${styles[`orientation-${orientation}`]} ${styles[`mobile-orientation-${mobileOrientation}`]} ${className ?? ""}`}
      style={
        // SAFETY: React accepts CSS custom properties at runtime; this narrows the style
        // object to the single custom property consumed by ListItemActions.module.css.
        {
          "--actions-width-desktop": widthPercentDesktop,
        } as ActionsStyleVars
      }
    >
      {children}
    </div>
  );
}
