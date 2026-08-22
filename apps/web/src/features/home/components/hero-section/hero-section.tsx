import type { FeedContentItemDto, RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { useFormatScholarName } from "@sd/domain-content";
import { Sparkles, Play, Shield, Scale, MessageSquare } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { AppAvatar } from "@/shared/components/app-avatar";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  featuredContent?: FeedContentItemDto | null;
  headline?: string | null;
  isLoading?: boolean;
  onResume?: (lectureSlug: string) => void;
  hasHistory?: boolean;
};

export function HeroSection({
  recentProgress,
  featuredContent,
  headline,
  isLoading = false,
  onResume,
  hasHistory = false,
}: HeroSectionProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();

  const heroItem =
    hasHistory && recentProgress
      ? {
          id: recentProgress.lectureId,
          slug: recentProgress.lectureSlug,
          title: recentProgress.lectureTitle,
          scholarName: recentProgress.scholarName,
          scholarSlug: recentProgress.scholarSlug,
          scholarTitle: undefined,
          format: recentProgress.format,
          artworkUrl: recentProgress.artworkUrl,
          scholarImageUrl: recentProgress.scholarImageUrl,
        }
      : featuredContent
        ? {
            id: featuredContent.id,
            slug: featuredContent.slug,
            title: featuredContent.title,
            scholarName: featuredContent.scholarName,
            scholarSlug: featuredContent.scholarSlug,
            scholarTitle: featuredContent.scholarTitle,
            format: featuredContent.kind,
            artworkUrl: featuredContent.thumbnailUrl ?? undefined,
            scholarImageUrl: featuredContent.scholarImageUrl,
          }
        : null;

  const { play: playHero } = usePlayListing(
    heroItem
      ? {
          id: heroItem.id,
          slug: heroItem.slug,
          title: heroItem.title,
          format: heroItem.format,
          scholarName: heroItem.scholarName,
          scholarSlug: heroItem.scholarSlug,
          artworkUrl: heroItem.artworkUrl,
        }
      : null,
  );

  const handleStart = () => {
    if (hasHistory && recentProgress) {
      if (onResume) {
        onResume(recentProgress.lectureSlug);
      } else {
        void playHero();
      }
    } else {
      void playHero();
    }
  };

  if (isLoading) {
    return (
      <section className={styles.hero} data-testid="home-hero-skeleton">
        <div className={styles.marginalia} aria-hidden="true">
          <span className={styles.arabicText}>دروس</span>
        </div>
        <div className={styles.bookmark} aria-hidden="true" />
        <div className={styles.content}>
          <div className={`${styles.skeletonLine} ${styles.skeletonEyebrow}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonSubtitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonCta}`} />
        </div>
        <div className={styles.visualRegion} aria-hidden="true">
          <div className={styles.visualFrame}>
            <div className={`${styles.skeletonLine} ${styles.skeletonArtwork}`} />
          </div>
        </div>
      </section>
    );
  }

  if (!heroItem) {
    return (
      <section className={styles.hero} data-testid="home-empty-state">
        <div className={styles.marginalia} aria-hidden="true">
          <span className={styles.arabicText}>دروس</span>
        </div>
        <div className={styles.bookmark} aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.eyebrow}>{t("home.empty.eyebrow", "A library for steady study")}</p>
          <h1 className={styles.title} data-testid="home-hero-title">
            {t("home.empty.title", "Find your next lesson")}
          </h1>
          <p className={styles.subtitle}>
            {t(
              "home.empty.description",
              "Browse lessons, scholars, and topics to begin building your listening path.",
            )}
          </p>
          <div className={styles.ctaRow}>
            <Link href={routes.explore.index} className={styles.startBtn}>
              <span>{t("home.empty.action", "Explore lessons")}</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const title = heroItem.title;
  const scholarName = formatScholarName({
    name: heroItem.scholarName,
    title: heroItem.scholarTitle,
  });

  return (
    <section className={styles.hero}>
      <div className={styles.marginalia} aria-hidden="true">
        <span className={styles.arabicText}>دروس</span>
      </div>
      <div className={styles.bookmark} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow} data-testid="home-hero-eyebrow">
          {hasHistory
            ? "AS-SALAMU 'ALAYKUM · CONTINUE YOUR DURUS"
            : headline
              ? headline.toUpperCase()
              : "AS-SALAMU 'ALAYKUM · FEATURED LESSON"}
        </p>
        <h1 className={styles.title} data-testid="home-hero-title">
          <Link href={routes.listings.detail(heroItem.slug)} className={styles.titleLink}>
            {title}
          </Link>
        </h1>
        <p className={styles.subtitle}>
          <Link href={routes.scholars.detail(heroItem.scholarSlug)} className={styles.scholarLink}>
            {scholarName}
          </Link>
        </p>
        {!hasHistory && (
          <p className={styles.recommendation}>
            <Sparkles size={13} color="var(--action-primary)" /> Recommended starting point for new
            students
          </p>
        )}
        <div className={styles.ctaRow}>
          <button
            type="button"
            className={styles.startBtn}
            onClick={handleStart}
            data-testid={hasHistory ? "home-hero-resume" : "home-hero-start"}
          >
            <Play size={14} fill="currentColor" />
            <span>
              {hasHistory
                ? t("home.hero.resume", "Resume")
                : t("home.hero.start", "Start listening")}
            </span>
          </button>

          {!hasHistory && (
            <>
              <span className={styles.browseLabel}>Explore by topic:</span>
              <Link href={`${routes.search}?topic=aqeedah`} className={styles.categoryPill}>
                <Shield size={13} color="var(--action-primary)" />
                <span>Aqeedah</span>
              </Link>
              <Link href={`${routes.search}?topic=fiqh`} className={styles.categoryPill}>
                <Scale size={13} color="var(--action-primary)" />
                <span>Fiqh</span>
              </Link>
              <Link href={`${routes.search}?topic=hadith`} className={styles.categoryPill}>
                <MessageSquare size={13} color="var(--action-primary)" />
                <span>Hadith</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className={styles.visualRegion}>
        <Link
          href={routes.listings.detail(heroItem.slug)}
          className={styles.visualFrame}
          aria-label={`Open ${title}`}
        >
          <HeroArtwork
            key={heroItem.id}
            artworkUrl={heroItem.artworkUrl}
            scholarImageUrl={heroItem.scholarImageUrl}
            scholarName={scholarName}
          />
        </Link>
      </div>
    </section>
  );
}

type HeroArtworkProps = {
  artworkUrl?: string;
  scholarImageUrl?: string;
  scholarName: string;
};

function HeroArtwork({ artworkUrl, scholarImageUrl, scholarName }: HeroArtworkProps) {
  return (
    <AppAvatar
      listingArtwork={artworkUrl}
      scholarImageUrl={scholarImageUrl}
      text={scholarName}
      fill
      sizes="(max-width: 640px) 42vw, 24vw"
      className={artworkUrl ? styles.artworkImage : styles.scholarArtwork}
    />
  );
}
