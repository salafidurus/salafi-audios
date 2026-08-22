"use client";

import type { ListingFormat } from "@sd/core-contracts";

import { useSearchCatalog } from "@sd/domain-search";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { CategoryChips } from "../category-chips/category-chips";
import styles from "./topic-discovery-section.module.css";

export function TopicDiscoverySection() {
  const { t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const [selectedTopic, setSelectedTopic] = useState("all");
  const { data, isLoading } = useSearchCatalog({
    topicSlugs: selectedTopic === "all" ? undefined : [selectedTopic],
    limit: 8,
  });
  const listings = useMemo(() => {
    if (!data) return [];
    return [
      ...data.collections.map((listing) => ({ ...listing, format: "collection" as const })),
      ...data.series.map((listing) => ({ ...listing, format: "series" as const })),
      ...data.singles.map((listing) => ({ ...listing, format: "single" as const })),
    ];
  }, [data]);

  return (
    <section
      className={styles.section}
      aria-label={t("home.discovery.label", "Explore the library")}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{t("home.discovery.eyebrow", "EXPLORE THE LIBRARY")}</p>
          <h2>{t("home.discovery.title", "Find your next direction")}</h2>
        </div>
        <p>
          {t(
            "home.discovery.description",
            "Choose a topic and stay right here to browse its lessons.",
          )}
        </p>
      </div>
      <CategoryChips value={selectedTopic} onValueChange={setSelectedTopic} />
      <div className={styles.rail} data-testid="topic-listings-rail" aria-live="polite">
        {isLoading && listings.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={`topic-skeleton-${index}`} className={styles.skeleton} />
            ))
          : listings.map((listing) => (
              <TopicListingCard
                key={listing.id}
                title={listing.title}
                scholarName={listing.scholarName}
                scholarSlug={listing.scholarSlug}
                slug={listing.slug}
                id={listing.id}
                format={listing.format}
                lectureCount={listing.lectureCount}
                durationSeconds={listing.durationSeconds}
                onNavigate={navigateToListing}
              />
            ))}
        {!isLoading && listings.length === 0 && (
          <p className={styles.empty}>
            {t("home.discovery.empty", "No lessons are available for this topic yet.")}
          </p>
        )}
      </div>
    </section>
  );
}

type TopicListingCardProps = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  scholarSlug: string;
  format: ListingFormat;
  lectureCount: number;
  durationSeconds?: number;
  onNavigate: (slug: string) => void;
};

function TopicListingCard({
  id,
  slug,
  title,
  scholarName,
  scholarSlug,
  format,
  lectureCount,
  durationSeconds,
  onNavigate,
}: TopicListingCardProps) {
  const { play } = usePlayListing({
    id,
    slug,
    title,
    format,
    scholarName,
    scholarSlug,
  });

  return (
    <article className={styles.card}>
      <div className={styles.cardMark} aria-hidden="true" />
      <p className={styles.cardType}>{format}</p>
      <h3>{title}</h3>
      <p className={styles.cardMeta}>
        {scholarName} · {lectureCount} {lectureCount === 1 ? "lesson" : "lessons"}
        {durationSeconds ? ` · ${Math.round(durationSeconds / 60)} min` : ""}
      </p>
      <div className={styles.cardActions}>
        <button type="button" onClick={() => void play()} aria-label={`Play ${title}`}>
          <Play size={14} fill="currentColor" />
        </button>
        <button type="button" className={styles.open} onClick={() => onNavigate(slug)}>
          View lesson
        </button>
      </div>
    </article>
  );
}
