"use client";

import { routes, type FeedContentItemDto, type ListingFormat } from "@sd/core-contracts";
import { useFormatScholarName } from "@sd/domain-content";
import { useSearchCatalog } from "@sd/domain-search";
import { Play } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { CategoryChips } from "../category-chips/category-chips";
import { HeroSection } from "../hero-section/hero-section";
import styles from "./topic-discovery-section.module.css";

type TopicDiscoverySectionProps = {
  featuredContent?: FeedContentItemDto | null;
  isFeaturedLoading?: boolean;
  onResume?: (lectureSlug: string) => void;
};

export function TopicDiscoverySection({
  featuredContent,
  isFeaturedLoading = false,
  onResume,
}: TopicDiscoverySectionProps) {
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
        <div className={styles.headingAside}>
          <p>
            {t(
              "home.discovery.description",
              "Choose a topic and stay right here to browse its lessons.",
            )}
          </p>
          <Link
            href={routes.explore.index}
            className={styles.exploreLink}
            data-testid="home-explore-link"
          >
            {t("home.discovery.explore", "Explore the library")}
          </Link>
        </div>
      </div>
      <div className={styles.featured} data-testid="home-featured-section">
        <div data-testid="home-hero-section">
          <HeroSection
            recentProgress={null}
            featuredContent={featuredContent}
            isLoading={isFeaturedLoading}
            onResume={onResume}
            hasHistory={false}
          />
        </div>
      </div>
      <div data-testid="home-category-section">
        <CategoryChips value={selectedTopic} onValueChange={setSelectedTopic} />
      </div>
      <div className={styles.rail} data-testid="topic-listings-rail" aria-live="polite">
        <div className={styles.track}>
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
                  scholarTitle={listing.scholarTitle}
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
  scholarTitle?: string | null;
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
  scholarTitle,
  format,
  lectureCount,
  durationSeconds,
  onNavigate,
}: TopicListingCardProps) {
  const formatScholarName = useFormatScholarName();
  const formattedScholarFallback = useFormattedScholarName(scholarName, scholarSlug);
  const displayScholarName = scholarTitle
    ? formatScholarName({ name: scholarName, title: scholarTitle })
    : formattedScholarFallback;
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
        {displayScholarName} · {lectureCount} {lectureCount === 1 ? "lesson" : "lessons"}
        {durationSeconds ? ` · ${Math.round(durationSeconds / 60)} min` : ""}
      </p>
      <div className={styles.cardActions}>
        <button type="button" onClick={() => void play()} aria-label={`Play ${title}`}>
          <Play size={14} fill="currentColor" />
        </button>
        <button type="button" className={styles.open} onClick={() => onNavigate(slug)}>
          View Listing
        </button>
      </div>
    </article>
  );
}
