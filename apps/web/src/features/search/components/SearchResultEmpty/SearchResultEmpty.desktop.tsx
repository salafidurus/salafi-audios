"use client";

export type SearchResultEmptyDesktopWebProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

const bodyStyle = {
  fontFamily: "var(--typo-body-md-font-family)",
  fontSize: "var(--typo-body-md-font-size)",
  lineHeight: "var(--typo-body-md-line-height)",
  letterSpacing: "var(--typo-body-md-letter-spacing)",
} as const;

export function SearchResultEmptyDesktopWeb({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyDesktopWebProps) {
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? "Searching..."
        : "No results found."
    : "Start typing to search.";

  return (
    <div className="mt-[var(--space-scale-4xl)] flex items-center justify-center rounded-[var(--radius-component-card)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-[var(--space-component-card-padding)] py-[var(--space-scale-3xl)] text-center text-[var(--content-muted)]">
      <p className="m-0" style={bodyStyle}>
        {message}
      </p>
    </div>
  );
}
