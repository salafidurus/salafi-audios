import type { ReactNode, MouseEvent, KeyboardEvent } from "react";

import { isHtmlElement } from "@/shared/lib/runtime-guards";

import styles from "./list-item.module.css";

export type ListItemProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  id?: string;
  /** Marks the row as momentarily highlighted (e.g. scrolled-to from a URL anchor) via `data-highlighted`. */
  highlighted?: boolean;
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
export function ListItem({
  children,
  onClick,
  className,
  id,
  highlighted = false,
  interactive = false,
}: ListItemProps) {
  const isClickable = Boolean(onClick);
  const showHoverStates = isClickable || interactive;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Don't trigger onClick if the click came from a nested interactive element
    const target = e.target;
    if (isIgnoredClickTarget(target)) return;
    onClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    handleListItemKeyDown(e, onClick);
  };

  return (
    <div
      id={id}
      data-highlighted={highlighted ? "true" : undefined}
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

function isIgnoredClickTarget(target: EventTarget | null): boolean {
  if (!isHtmlElement(target)) return true;
  return Boolean(
    target.tagName === "BUTTON" ||
    target.closest("button") ||
    target.closest("[data-testid='list-item-actions']"),
  );
}

function handleListItemKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  onClick: (() => void) | undefined,
): void {
  if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  onClick();
}
