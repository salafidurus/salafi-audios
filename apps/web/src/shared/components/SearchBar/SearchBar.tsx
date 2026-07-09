"use client";

import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

export interface SearchBarProps {
  /** Current search value (controlled input) */
  value: string;
  /** Fires on every keystroke - parent filters data */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Loading state (shows spinner in icon area) */
  loading?: boolean;
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
  loading = false,
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
      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
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
      </div>
      {filters && <div className={styles.filters}>{filters}</div>}
    </div>
  );
}
