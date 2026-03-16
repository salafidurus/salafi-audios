import { Activity } from "@/shared/components/activity/activity";
import type { SearchCatalogItemDto } from "@sd/contracts";

type SearchResultsProps = {
  results: Array<SearchCatalogItemDto & { group: string }>;
  isFetching: boolean;
  shouldSearch: boolean;
  error: unknown;
};

export function SearchResults({ results, isFetching, shouldSearch, error }: SearchResultsProps) {
  return (
    <div className="flex flex-col gap-[var(--space-component-gap-md)]">
      {isFetching && shouldSearch ? <Activity label="Searching..." /> : null}
      {error ? (
        <p
          className="text-center text-[var(--content-muted)]"
          style={{
            fontFamily: "var(--typo-caption-font-family)",
            fontSize: "var(--typo-caption-font-size)",
            lineHeight: "var(--typo-caption-line-height)",
          }}
        >
          Something went wrong. Please try again.
        </p>
      ) : null}
      {!isFetching && shouldSearch && results.length === 0 ? (
        <p
          className="text-center text-[var(--content-muted)]"
          style={{
            fontFamily: "var(--typo-caption-font-family)",
            fontSize: "var(--typo-caption-font-size)",
            lineHeight: "var(--typo-caption-line-height)",
          }}
        >
          No results yet.
        </p>
      ) : null}
      <div className="grid gap-[var(--space-component-gap-md)] sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <article
            key={`${item.group}-${item.id}`}
            className="flex flex-col gap-[var(--space-component-gap-sm)] rounded-[var(--radius-component-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-[var(--space-component-card-padding)] shadow-[var(--shadow-xs)]"
          >
            <p
              className="uppercase text-[var(--content-subtle)]"
              style={{
                fontFamily: "var(--typo-caption-font-family)",
                fontSize: "var(--typo-caption-font-size)",
                lineHeight: "var(--typo-caption-line-height)",
                letterSpacing: "0.08em",
              }}
            >
              {item.group}
            </p>
            <p
              className="text-[var(--content-strong)]"
              style={{
                fontFamily: "var(--typo-title-md-font-family)",
                fontSize: "var(--typo-title-md-font-size)",
                lineHeight: "var(--typo-title-md-line-height)",
                letterSpacing: "var(--typo-title-md-letter-spacing)",
              }}
            >
              {item.title}
            </p>
            <p
              className="text-[var(--content-muted)]"
              style={{
                fontFamily: "var(--typo-body-sm-font-family)",
                fontSize: "var(--typo-body-sm-font-size)",
                lineHeight: "var(--typo-body-sm-line-height)",
              }}
            >
              {item.scholarName}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
