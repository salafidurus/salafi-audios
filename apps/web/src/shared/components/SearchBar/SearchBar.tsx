"use client";

import { X } from "lucide-react";
import styles from "./SearchBar.module.css";

export interface SearchBarProps {
  /** Current search value (controlled input) */
  value: string;
  /** Fires on every keystroke - parent filters data */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when clear button clicked */
  onClear?: () => void;
  /** Optional filter controls (status dropdown, etc.) */
  filters?: React.ReactNode;
  /** Optional className for container */
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  filters,
  className,
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const showClearButton = value.length > 0;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <label className={styles.inputWrapper} aria-label="Search">
        <SearchGlyph />
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          aria-label="Search"
        />
        {showClearButton && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </label>
      {filters && <div className={styles.filters}>{filters}</div>}
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={styles.searchIcon}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}
