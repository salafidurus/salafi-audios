"use client";

import { X } from "lucide-react";
import styles from "./Search.module.css";

export interface SearchBarProps {
  /** Current search value (controlled input) */
  value: string;
  /** Fires on every keystroke - parent manages filtering/debouncing */
  onChange: (value: string) => void;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Optional className for container */
  className?: string;
}

/**
 * Search.Bar — Standardized search input container.
 *
 * Provides:
 * - Controlled text input with search icon
 * - Clear button when value is non-empty
 * - Responsive layout via CSS media queries
 * - Design token spacing and colors
 *
 * Usage:
 * ```tsx
 * const [searchValue, setSearchValue] = useState('');
 *
 * <Search.Bar
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   placeholder="Search scholars..."
 * />
 * ```
 *
 * For filters, pair with Search.Filter to create a complete search UI.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
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
    <div className={`${styles.barContainer} ${className || ""}`}>
      <label className={styles.barInputWrapper} aria-label="Search">
        <SearchGlyph />
        <input
          type="text"
          className={styles.barInput}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          aria-label="Search input"
        />
        {showClearButton && (
          <button
            type="button"
            className={styles.barClearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </label>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={styles.barSearchIcon}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}
