"use client";

import styles from "./Search.module.css";

export interface SearchButtonProps {
  /** Label text for the button */
  label: string;
  /** Callback when button is clicked */
  onClick?: () => void;
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
export function SearchButton({ label, onClick }: SearchButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <div className={styles.barContainer}>
      <button
        type="button"
        className={styles.barInputWrapper}
        onClick={handleClick}
        aria-label={label}
        style={{ all: "unset", display: "contents" }}
      >
        <SearchGlyph />
        <span className={styles.barPlaceholder}>{label}</span>
      </button>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={styles.barSearchIcon}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}
