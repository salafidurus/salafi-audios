import type React from "react";

import type { SearchResultRow } from "../../utils/build-search-result-items";

export type SearchResultsListDesktopWebProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

const captionStyle = {
  fontFamily: "var(--typo-caption-font-family)",
  lineHeight: "var(--typo-caption-line-height)",
  letterSpacing: "var(--typo-caption-letter-spacing)",
} as const;

export function SearchResultsListDesktopWeb({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListDesktopWebProps) {
  return (
    <div className="flex flex-col gap-[var(--space-component-gap-md)]">
      {isFetching && shouldSearch ? (
        <p className="text-center text-[var(--content-muted)]" style={captionStyle}>
          Searching…
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-center text-[var(--content-muted)]" style={captionStyle}>
          {errorMessage}
        </p>
      ) : null}
      {!isFetching && shouldSearch && items.length === 0 ? (
        <p className="text-center text-[var(--content-muted)]" style={captionStyle}>
          No results yet.
        </p>
      ) : null}
      <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
        {items.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  );
}
