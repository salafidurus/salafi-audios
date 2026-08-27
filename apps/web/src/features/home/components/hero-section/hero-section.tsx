import type { FeedContentItemDto, RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { useFormatScholarName } from "@sd/domain-content";
import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { AppAvatar } from "@/shared/components/app-avatar";
import { Button } from "@/shared/components/ui/button";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  featuredContent?: FeedContentItemDto | null;
  headline?: string | null;
  isLoading?: boolean;
  onResume?: (lectureSlug: string) => void;
  hasHistory?: boolean;
};

type HeroItem = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  scholarSlug: string;
  scholarTitle?: string;
  format: FeedContentItemDto["kind"] | RecentProgressDto["format"];
  artworkUrl?: string;
  scholarImageUrl?: string;
};

function getHeroItem(
  hasHistory: boolean,
  recentProgress: RecentProgressDto | null | undefined,
  featuredContent: FeedContentItemDto | null | undefined,
): HeroItem | null {
  if (hasHistory && recentProgress) {
    return {
      id: recentProgress.listingSlug,
      slug: recentProgress.lectureSlug,
      title: recentProgress.lectureTitle,
      scholarName: recentProgress.scholarName,
      scholarSlug: recentProgress.scholarSlug,
      format: recentProgress.format,
      artworkUrl: recentProgress.artworkUrl,
      scholarImageUrl: recentProgress.scholarImageUrl,
    };
  }
  if (!featuredContent) return null;
  return {
    id: featuredContent.id,
    slug: featuredContent.slug,
    title: featuredContent.title,
    scholarName: featuredContent.scholarName,
    scholarSlug: featuredContent.scholarSlug,
    scholarTitle: featuredContent.scholarTitle,
    format: featuredContent.kind,
    artworkUrl: featuredContent.thumbnailUrl ?? undefined,
    scholarImageUrl: featuredContent.scholarImageUrl,
  };
}

function getHeroScholarName(
  heroItem: HeroItem,
  formatScholarName: ReturnType<typeof useFormatScholarName>,
  formattedScholarFallback: string,
): string {
  if (!heroItem.scholarTitle) return formattedScholarFallback;
  return formatScholarName({
    name: heroItem.scholarName,
    title: heroItem.scholarTitle,
  });
}

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

  const heroItem = getHeroItem(hasHistory, recentProgress, featuredContent);

  const formattedScholarFallback = useFormattedScholarName(
    heroItem?.scholarName,
    heroItem?.scholarSlug,
  );

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
            <Button asChild variant="primary" size="lg" className={styles.startBtn}>
              <Link href={routes.explore.index}>{t("home.empty.action", "Explore lessons")}</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const title = heroItem.title;
  const scholarName = getHeroScholarName(heroItem, formatScholarName, formattedScholarFallback);

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
              : "AS-SALAMU 'ALAYKUM · FEATURED LISTING"}
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
          <Button
            type="button"
            className={styles.startBtn}
            onClick={handleStart}
            data-testid={hasHistory ? "home-hero-resume" : "home-hero-start"}
            variant="primary"
            size="lg"
            icon={<Play fill="currentColor" aria-hidden="true" />}
          >
            {hasHistory ? t("home.hero.resume", "Resume") : t("home.hero.start", "Start listening")}
          </Button>

          {!hasHistory && (
            <div className={styles.topicRail}>
              <span className={styles.browseLabel}>Explore by topic:</span>
              <Button asChild variant="outline" size="sm" className={styles.categoryPill}>
                <Link href={`${routes.search}?topic=aqeedah`}>Aqeedah</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className={styles.categoryPill}>
                <Link href={`${routes.search}?topic=fiqh`}>Fiqh</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className={styles.categoryPill}>
                <Link href={`${routes.search}?topic=hadith`}>Hadith</Link>
              </Button>
            </div>
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
