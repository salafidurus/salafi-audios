"use client";

import { SearchGlyph } from "./SearchGlyph";
import styles from "./Search.module.css";

export interface SearchButtonProps {
  /** Label text for the button */
  label: string;
  /** Callback when button is clicked */
  onClick?: () => void;
  /** Optional CSS class for the input wrapper button */
  inputWrapperClassName?: string;
  /** Optional CSS class for the bar container */
  barContainerClassName?: string;
  /** Optional CSS class for the placeholder text */
  placeholderClassName?: string;
}

/**
 * Search.Button — Visually identical to Search.Bar but clickable.
 *
 * Renders the same search input appearance as Search.Bar, but instead of
 * being an editable input, it's a clickable button that navigates to the
 * search page or performs another action.
 *
 * Usage:
 * ```tsx
 * <Search.Button
 *   label="What do you want to listen to?"
 *   onClick={() => navigateToSearch()}
 * />
 * ```
 */
export function SearchButton({
  label,
  onClick,
  inputWrapperClassName,
  barContainerClassName,
  placeholderClassName,
}: SearchButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <div className={`${styles.barContainer} ${barContainerClassName || ""}`}>
      <button
        type="button"
        className={`${styles.barInputWrapper} ${inputWrapperClassName || ""}`}
        onClick={handleClick}
        aria-label={label}
      >
        <SearchGlyph />
        <span className={`${styles.barPlaceholder} ${placeholderClassName || ""}`}>{label}</span>
      </button>
    </div>
  );
}
