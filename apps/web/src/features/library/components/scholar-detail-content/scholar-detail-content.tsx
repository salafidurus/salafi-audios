"use client";

import Image from "next/image";
import type { RecommendationItem, ScholarStats } from "@/features/home/api/public-api";
import { ScholarTabs } from "@/features/library/components/scholar-tabs/scholar-tabs";
import { Button } from "@/shared/components/button/button";
import { ScholarHero } from "@/shared/components/scholar-hero/scholar-hero";
import type { ScholarHeroItem } from "@/shared/components/scholar-hero/scholar-hero";
import { Globe, Send, Twitter, Youtube } from "lucide-react";
import styles from "./scholar-detail-content.module.css";

type Scholar = {
  id: string;
  slug: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  country?: string | null;
  isKibar?: boolean;
  socialTwitter?: string | null;
  socialTelegram?: string | null;
  socialYoutube?: string | null;
  socialWebsite?: string | null;
};

type CollectionItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
};

type SeriesItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
  collectionId?: string | null;
};

type LectureItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  durationSeconds?: number;
  publishedAt?: string;
};

type ScholarDetailContentProps = {
  scholar: Scholar;
  stats: ScholarStats | null;
  collections: CollectionItem[];
  seriesInCollections: SeriesItem[];
  standaloneSeries: SeriesItem[];
  popularLectures: RecommendationItem[];
  featuredLectures?: LectureItem[];
};

export function ScholarDetailContent({
  scholar,
  stats,
  collections,
  seriesInCollections,
  standaloneSeries,
  popularLectures,
  featuredLectures = [],
}: ScholarDetailContentProps) {
  const hasSocialLinks =
    scholar.socialTwitter ||
    scholar.socialTelegram ||
    scholar.socialYoutube ||
    scholar.socialWebsite;

  const heroItem: ScholarHeroItem = {
    id: scholar.id,
    slug: scholar.slug,
    name: scholar.name,
    subtitle: scholar.country || undefined,
    bio: scholar.bio || undefined,
    imageUrl: scholar.imageUrl || undefined,
    collectionsCount: stats?.collectionsCount ?? 0,
    standaloneSeriesCount: stats?.standaloneSeriesCount ?? 0,
    standaloneLecturesCount: stats?.standaloneLecturesCount ?? 0,
    isKibar: scholar.isKibar ?? false,
  };

  return (
    <div className={styles.page}>
      <ScholarHero items={[heroItem]} singleMode />

      {featuredLectures.length > 0 && (
        <section className={styles.featuredSection}>
          <h2 className={styles.featuredTitle}>Featured Lessons</h2>
          <div className={styles.featuredGrid}>
            {featuredLectures.slice(0, 5).map((lecture) => (
              <a
                key={lecture.id}
                href={`/lectures/${scholar.slug}/${lecture.slug}`}
                className={styles.featuredCard}
              >
                <div className={styles.featuredImageWrap}>
                  <Image
                    src={lecture.coverImageUrl || "/dev-mock/template-4-to-5-image.jpg"}
                    alt={lecture.title}
                    fill
                    className={styles.featuredImage}
                  />
                  <div className={styles.featuredOverlay}>
                    <h3 className={styles.featuredCardTitle}>{lecture.title}</h3>
                    {lecture.durationSeconds && (
                      <span className={styles.featuredMeta}>
                        {formatDuration(lecture.durationSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <ScholarTabs
            scholarSlug={scholar.slug}
            collections={collections}
            seriesInCollections={seriesInCollections}
            standaloneSeries={standaloneSeries}
            embedded
          />
        </div>

        <aside className={styles.sidebar}>
          {hasSocialLinks && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Official Channels</h3>
              <div className={styles.socialLinks}>
                {scholar.socialTwitter && (
                  <a
                    href={scholar.socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                    <span>Twitter</span>
                  </a>
                )}
                {scholar.socialTelegram && (
                  <a
                    href={scholar.socialTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Telegram"
                  >
                    <Send size={20} />
                    <span>Telegram</span>
                  </a>
                )}
                {scholar.socialYoutube && (
                  <a
                    href={scholar.socialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="YouTube"
                  >
                    <Youtube size={20} />
                    <span>YouTube</span>
                  </a>
                )}
                {scholar.socialWebsite && (
                  <a
                    href={scholar.socialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Website"
                  >
                    <Globe size={20} />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {popularLectures.length > 0 && (
            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sidebarTitle}>Popular Lectures</h3>
                <svg
                  className={styles.trendingIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className={styles.popularList}>
                {popularLectures.slice(0, 5).map((item, index) => {
                  const href = buildPopularHref(item, scholar.slug);
                  return (
                    <a
                      key={`${item.kind}:${item.entityId}`}
                      href={href}
                      className={styles.popularItem}
                    >
                      <span className={styles.popularRank}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.popularInfo}>
                        <h4 className={styles.popularTitle}>{item.title}</h4>
                        <span className={styles.popularMeta}>{formatPopularMeta(item)}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.resourceCard}>
            <span className={styles.resourceLabel}>Resource Library</span>
            <h3 className={styles.resourceTitle}>Download the Scholar&apos;s Translated Works</h3>
            <Button variant="outline" size="md" className={styles.resourceButton}>
              Browse E-Books →
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function buildPopularHref(item: RecommendationItem, scholarSlug: string): string {
  if (item.kind === "collection") {
    return `/collections/${scholarSlug}/${item.entitySlug}`;
  }
  if (item.kind === "series") {
    return `/series/${scholarSlug}/${item.entitySlug}`;
  }
  return `/lectures/${scholarSlug}/${item.entitySlug}`;
}

function formatPopularMeta(item: RecommendationItem): string {
  const parts: string[] = [];
  if (item.lessonCount) {
    parts.push(`${item.lessonCount} ${item.lessonCount === 1 ? "lesson" : "lessons"}`);
  }
  if (item.totalDurationSeconds) {
    const minutes = Math.floor(item.totalDurationSeconds / 60);
    parts.push(`${minutes}m`);
  }
  return parts.join(" • ");
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
