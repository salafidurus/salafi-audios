"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { SearchGlyph } from "./SearchGlyph";
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
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Optional inline style for the input wrapper (barInputWrapper label) */
  inputWrapperStyle?: React.CSSProperties;
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
  autoFocus,
  inputWrapperStyle,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus || !inputRef.current) {
      return;
    }
    // Use setTimeout to ensure focus happens after render
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus]);

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
      <label className={styles.barInputWrapper} style={inputWrapperStyle} aria-label="Search">
        <SearchGlyph />
        <input
          ref={inputRef}
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
