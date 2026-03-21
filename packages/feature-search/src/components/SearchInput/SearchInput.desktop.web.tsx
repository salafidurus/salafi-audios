import clsx from "clsx";
import { forwardRef, type CSSProperties } from "react";

export type SearchInputDesktopWebProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
};

const shellClass =
  "flex w-full items-center gap-3 rounded-[var(--radius-scale-full)] border border-[var(--border-default)] bg-[var(--surface-default)] px-5 py-3 transition focus-within:border-[var(--border-primary)] focus-within:bg-[var(--surface-default)]";

const inputClass =
  "w-full bg-transparent text-[var(--content-default)] outline-none placeholder:text-[var(--content-muted)]";

const inputStyle: CSSProperties = {
  fontFamily: "var(--typo-body-lg-font-family)",
  fontSize: "var(--typo-body-lg-font-size)",
  lineHeight: "var(--typo-body-lg-line-height)",
  letterSpacing: "var(--typo-body-lg-letter-spacing)",
  fontWeight: "var(--typo-body-lg-font-weight)",
};

export const SearchInputDesktopWeb = forwardRef<HTMLInputElement, SearchInputDesktopWebProps>(
  ({ placeholder, className, value, onChange, autoFocus }, ref) => {
  return (
    <label className={clsx(shellClass, className)} aria-label="Search library" style={inputStyle}>
      <SearchGlyph />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={inputClass}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoFocus={autoFocus}
        style={inputStyle}
      />
    </label>
  );
  },
);

SearchInputDesktopWeb.displayName = "SearchInputDesktopWeb";

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-[var(--content-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}
