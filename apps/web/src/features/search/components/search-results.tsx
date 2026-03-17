import { Play, Headphones, Clock } from "lucide-react";
import { Activity } from "@/shared/components/activity/activity";
import type { SearchCatalogItemDto } from "@sd/contracts";

type SearchResultsProps = {
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

const bodySmStyle = {
  fontFamily: "var(--typo-body-sm-font-family)",
  lineHeight: "var(--typo-body-sm-line-height)",
} as const;

const titleMdStyle = {
  fontFamily: "var(--typo-title-md-font-family)",
  lineHeight: "var(--typo-title-md-line-height)",
  letterSpacing: "var(--typo-title-md-letter-spacing)",
  fontWeight: "var(--typo-title-md-font-weight)",
} as const;

export function SearchResults({ results, isFetching, shouldSearch, error }: SearchResultsProps) {
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
        {results.map((item) => {
          const imageUrl = item.coverImageUrl ?? item.scholarImageUrl;
          const durationLabel = formatDuration(item.durationSeconds);
          return (
            <article
              key={`${item.group}-${item.id}`}
              className="flex items-center gap-[var(--space-component-gap-md)] py-3 transition hover:bg-[var(--surface-hover)] rounded-[var(--radius-component-card)] px-2 cursor-pointer"
            >
              {/* Left: cover image */}
              <div className="w-[20%] xl:w-[10%] shrink-0 aspect-[4/5] overflow-hidden rounded-[var(--radius-component-panel-sm)] bg-[var(--surface-subtle)] flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Headphones size={22} style={{ color: "var(--content-subtle)" }} aria-hidden />
                )}
              </div>

              {/* Middle: info */}
              <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-scale-xs)]">
                <p
                  className="truncate text-[var(--content-strong)] [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
                  style={titleMdStyle}
                >
                  {item.title}
                </p>
                <p
                  className="truncate text-[var(--content-muted)] [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
                  style={bodySmStyle}
                >
                  {item.scholarName}
                </p>
                <div
                  className="flex items-center gap-[var(--space-scale-xs)] text-[var(--content-muted)] [font-size:var(--typo-caption-font-size)] xl:[font-size:var(--typo-body-sm-font-size)]"
                  style={captionStyle}
                >
                  <Headphones size={11} aria-hidden />
                  <span>
                    {item.lectureCount} {item.lectureCount === 1 ? "lecture" : "lectures"}
                  </span>
                  {durationLabel ? (
                    <>
                      <span aria-hidden>·</span>
                      <Clock size={11} aria-hidden />
                      <span>{durationLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Right: 10% play button */}
              <div className="flex w-[10%] shrink-0 justify-center">
                <button
                  type="button"
                  aria-label={`Play ${item.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--content-muted)] transition hover:border-[var(--border-primary)] hover:bg-[var(--surface-selected)] hover:text-[var(--content-primary)]"
                >
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) return "";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  if (hours > 0) return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  if (minutes <= 0) return "";
  return `${minutes}m`;
}
