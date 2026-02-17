import type { RecommendationItem } from "@/features/home/api/public-api";
import { ScholarDetailDto } from "@sd/contracts";
import { Globe, Send, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import styles from "./scholar-sidebar.module.css";

interface ScholarSidebarProps {
  scholar: ScholarDetailDto;
  popularItems: RecommendationItem[];
}

export function ScholarSidebar({ scholar, popularItems }: ScholarSidebarProps) {
  const hasSocialLinks =
    scholar.socialTwitter ||
    scholar.socialTelegram ||
    scholar.socialYoutube ||
    scholar.socialWebsite;

  return (
    <aside className={styles.sidebar}>
      {/* Official Channels */}
      {hasSocialLinks && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Official Channels</h3>
          <div className={styles.socialGrid}>
            {scholar.socialTwitter && (
              <a
                href={scholar.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
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
              >
                <Globe size={20} />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Popular Lessons */}
      {popularItems.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Popular Lessons</h3>
            <TrendingIcon />
          </div>
          <div className={styles.lecturesList}>
            {popularItems.map((item, index) => (
              <Link
                key={`${item.kind}:${item.entityId}`}
                className={styles.lectureItem}
                href={buildPopularHref(item)}
              >
                <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.lectureInfo}>
                  <h4 className={styles.lectureTitle}>{item.title}</h4>
                  <span className={styles.lectureMeta}>{popularMetaLabel(item)}</span>
                </div>
              </Link>
            ))}
          </div>

          <button type="button" className={styles.showMore} aria-disabled="true">
            Show more activity
          </button>
        </div>
      )}

      {/* Resource Library Card */}
      <div className={styles.resourceCard}>
        <div className={styles.resourceContent}>
          <span className={styles.resourceLabel}>Resource Library</span>
          <h3 className={styles.resourceTitle}>Download the Scholar&apos;s Translated Works</h3>
          <button className={styles.resourceButton}>
            Browse E-Books
            <span>→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function TrendingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={styles.trendingIcon}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function buildPopularHref(item: RecommendationItem): string {
  const scholarSlug = item.scholarSlug ?? "";

  if (item.kind === "collection") {
    return `/collections/${scholarSlug}/${item.entitySlug}`;
  }

  if (item.kind === "series") {
    return `/series/${scholarSlug}/${item.entitySlug}`;
  }

  return `/lectures/${scholarSlug}/${item.entitySlug}`;
}

function popularMetaLabel(item: RecommendationItem): string {
  if (item.kind === "collection") return "Collection";
  if (item.kind === "series") return "Series";
  return "Standalone lecture";
}
