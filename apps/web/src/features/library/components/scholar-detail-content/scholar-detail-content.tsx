"use client";

import type { RecommendationItem, ScholarStats } from "@/features/home/api/public-api";
import { ScholarAvatarCard } from "@/features/library/components/cards/scholar-avatar/scholar-avatar-card";
import { ShareButton } from "@/features/library/components/controls/share-button/share-button";
import { ScholarTabs } from "@/features/library/components/scholar-tabs/scholar-tabs";
import { Button } from "@/shared/components/button/button";
import { formatCompactNumber } from "@/shared/utils/format";
import { Globe, Send, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import styles from "./scholar-detail-content.module.css";

type Scholar = {
  id: string;
  slug: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  country?: string | null;
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
};

type ScholarDetailContentProps = {
  scholar: Scholar;
  stats: ScholarStats | null;
  collections: CollectionItem[];
  seriesInCollections: SeriesItem[];
  standaloneSeries: SeriesItem[];
  popularLectures: RecommendationItem[];
};

type TabId = "collections" | "series" | "standalone";

export function ScholarDetailContent({
  scholar,
  stats,
  collections,
  seriesInCollections,
  standaloneSeries,
  popularLectures,
}: ScholarDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("collections");
  const pageUrl = `/scholars/${scholar.slug}`;

  const hasSocialLinks =
    scholar.socialTwitter ||
    scholar.socialTelegram ||
    scholar.socialYoutube ||
    scholar.socialWebsite;

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <ScholarAvatarCard
              name={scholar.name}
              size="lg"
              featured
              showInitial={true}
              imageUrl={scholar.imageUrl ?? undefined}
            />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <div>
                <h1 className={styles.scholarName}>{scholar.name}</h1>
                {scholar.country && (
                  <p className={styles.scholarBadge}>
                    <span className={styles.badgeLabel}>Senior Scholar</span>
                    <span className={styles.badgeSeparator}>•</span>
                    <span className={styles.badgeCountry}>{scholar.country}</span>
                  </p>
                )}
              </div>

              <div className={styles.headerActions}>
                <Button variant="primary" size="md">
                  Follow
                </Button>
                <ShareButton url={pageUrl} title={scholar.name} />
              </div>
            </div>

            {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}

            <div className={styles.stats}>
              {stats && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {formatCompactNumber(stats.seriesCount)}
                    </span>
                    <span className={styles.statLabel}>Series</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {formatCompactNumber(stats.lecturesCount)}
                    </span>
                    <span className={styles.statLabel}>Lectures</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {formatCompactNumber(stats.followerCount)}
                    </span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={activeTab === "collections" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
          <button
            type="button"
            className={activeTab === "series" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("series")}
          >
            Series
          </button>
          <button
            type="button"
            className={activeTab === "standalone" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("standalone")}
          >
            Standalone Lectures
          </button>
        </div>

        <div className={styles.tabContent}>
          <ScholarTabs
            scholarSlug={scholar.slug}
            collections={collections}
            seriesInCollections={seriesInCollections}
            standaloneSeries={standaloneSeries}
            embedded
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
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
                    <span className={styles.popularRank}>{String(index + 1).padStart(2, "0")}</span>
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
