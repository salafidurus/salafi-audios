import type { ReactNode, MouseEvent, KeyboardEvent } from "react";
import styles from "./list-item.module.css";

export type ListItemProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  /**
   * If true, shows hover/active states even without onClick.
   * Useful for items with nested interactive elements.
   */
  interactive?: boolean;
};

/**
 * List item component following the /explore screen pattern.
 * - Transparent background by default
 * - Hover state with surface-hover when interactive
 * - Divider border between items (handled by + selector in CSS)
 * - Flex layout with media query for responsive behavior: flex-row on desktop/tablet, flex-column on mobile
 * - Should be used inside ListContainer
 * - Compatible with List.Item.Actions which positions on right (desktop/tablet) or below (mobile)
 */
export function ListItem({ children, onClick, className, interactive = false }: ListItemProps) {
  const isClickable = Boolean(onClick);
  const showHoverStates = isClickable || interactive;

  const handleClick = (_e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${styles.item} ${showHoverStates ? styles.interactive : ""} ${className ?? ""}`}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      {children}
    </div>
  );
}
