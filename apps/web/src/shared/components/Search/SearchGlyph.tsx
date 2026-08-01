"use client";

import styles from "./Search.module.css";

/**
 * Internal search icon glyph
 * @internal Used only by Search.Bar and Search.Button
 */
export function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
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
