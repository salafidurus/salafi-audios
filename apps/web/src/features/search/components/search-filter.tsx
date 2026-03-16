import clsx from "clsx";
import type { TopicDetailDto } from "@sd/contracts";

type SearchFilterProps = {
  topics: TopicDetailDto[];
  active: string[];
  onToggle: (slug: string) => void;
};

export function SearchFilter({ topics, active, onToggle }: SearchFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-[var(--space-component-gap-sm)]">
      {topics.slice(0, 8).map((topic) => {
        const isActive = active.includes(topic.slug);
        return (
          <button
            key={topic.slug}
            type="button"
            className={clsx(
              "rounded-[var(--radius-component-chip)] border px-3 py-1 text-[var(--content-muted)] transition",
              "border-[var(--border-default)] bg-[var(--surface-default)]",
              isActive &&
                "border-[var(--border-primary)] bg-[var(--surface-selected)] text-[var(--content-strong)]",
            )}
            style={{
              fontFamily: "var(--typo-label-md-font-family)",
              fontSize: "var(--typo-label-md-font-size)",
              lineHeight: "var(--typo-label-md-line-height)",
              letterSpacing: "var(--typo-label-md-letter-spacing)",
              fontWeight: "var(--typo-label-md-font-weight)",
            }}
            onClick={() => onToggle(topic.slug)}
          >
            {topic.name}
          </button>
        );
      })}
    </div>
  );
}
