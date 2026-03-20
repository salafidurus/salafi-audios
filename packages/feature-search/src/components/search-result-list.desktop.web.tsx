import { Activity } from "@sd/shared";
import type { SearchCatalogItemDto } from "@sd/contracts";
import { SearchResultItem } from "./search-result-item";

type SearchResultListProps = {
  results: Array<SearchCatalogItemDto & { group: string }>;
  isFetching: boolean;
  shouldSearch: boolean;
  error: unknown;
};

const captionStyle = {
  fontFamily: "var(--typo-caption-font-family)",
  lineHeight: "var(--typo-caption-line-height)",
  letterSpacing: "var(--typo-caption-letter-spacing)",
} as const;

export function SearchResultList({
  results,
  isFetching,
  shouldSearch,
  error,
}: SearchResultListProps) {
  return (
    <div className="flex flex-col gap-[var(--space-component-gap-md)]">
      {isFetching && shouldSearch ? <Activity label="Searching..." /> : null}
      {error ? (
        <p className="text-center text-[var(--content-muted)]" style={captionStyle}>
          Something went wrong. Please try again.
        </p>
      ) : null}
      {!isFetching && shouldSearch && results.length === 0 ? (
        <p className="text-center text-[var(--content-muted)]" style={captionStyle}>
          No results yet.
        </p>
      ) : null}
      <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
        {results.map((item) => (
          <SearchResultItem key={`${item.group}-${item.id}`} {...item} />
        ))}
      </div>
    </div>
  );
}
