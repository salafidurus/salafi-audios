import type { Metadata } from "next";
import { catalogApi } from "@/features/catalog/api/catalog-public.api";
import type { FeaturedHomeItem } from "@/features/catalog/api/catalog-public.api";
import { NowPlayingBar } from "@/features/catalog/components/audio/now-playing-bar";
import { LectureMediaCard } from "@/features/catalog/components/cards/lecture-media-card";
import { ScholarAvatarCard } from "@/features/catalog/components/cards/scholar-avatar-card";
import { TrendingCard } from "@/features/catalog/components/cards/trending-card";
import { CatalogFooter } from "@/features/catalog/components/layout/catalog-footer";
import { CatalogTopNav } from "@/features/catalog/components/navigation/catalog-top-nav";
import { HomeHero } from "@/features/catalog/components/hero/home-hero";
import { HomeContentNav } from "@/features/catalog/components/content-nav/home-content-nav";
import "./home.css";
import { formatDuration } from "@/features/catalog/utils/catalog-format";
import { canonical } from "@/features/catalog/utils/catalog-seo";
import { Button } from "@/shared/components/button/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

type HomeViewModel = {
  scholars: Awaited<ReturnType<typeof catalogApi.listScholars>>;
  featuredScholarName: string;
  heroItems: FeaturedHomeItem[];
  recentLectures: Array<{
    title: string;
    scholarName: string;
    duration?: string;
    coverImageUrl?: string;
    language?: string;
    publishedAt: string;
  }>;
  trendingLectures: Array<{
    title: string;
    scholarName: string;
    plays: string;
    coverImageUrl?: string;
    duration?: string;
  }>;
};

export function getHomeMetadata(): Metadata {
  return {
    title: "Browse",
    description: "Discover published scholars, series, and lectures in Salafi Durus.",
    alternates: { canonical: canonical("/") },
  };
}

async function loadHomeViewModel(): Promise<HomeViewModel> {
  // Intentionally tolerate missing NEXT_PUBLIC_API_URL in CI build environments.
  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const heroItems = await safe(() => catalogApi.listFeaturedHome(), []);
  const scholars = await safe(() => catalogApi.listScholars(), []);

  if (scholars.length === 0) {
    return {
      scholars: [],
      featuredScholarName: "Salafi Durus",
      heroItems,
      recentLectures: [],
      trendingLectures: [],
    };
  }

  const scholarSeriesBundles = await Promise.all(
    scholars.slice(0, 6).map(async (scholar) => ({
      scholar,
      series: await safe(() => catalogApi.listScholarSeries(scholar.slug), []),
    })),
  );

  const featuredBundle = scholarSeriesBundles.find((bundle) => bundle.series.length > 0) ?? null;
  const featuredScholar = featuredBundle?.scholar ?? scholars[0];
  // Featured hero items come from the dedicated endpoint.

  const lectureSourceSeries = scholarSeriesBundles
    .flatMap((bundle) =>
      bundle.series.slice(0, 2).map((series) => ({ scholar: bundle.scholar, series })),
    )
    .slice(0, 8);

  const lectureGroups = await Promise.all(
    lectureSourceSeries.map(async ({ scholar, series }) => ({
      scholar,
      series,
      lectures: await safe(() => catalogApi.listSeriesLectures(scholar.slug, series.slug), []),
    })),
  );

  const recentLectures = lectureGroups
    .flatMap(({ scholar, series, lectures }) =>
      lectures.slice(0, 2).map((lecture) => ({
        title: lecture.title,
        scholarName: scholar.name,
        duration: formatDuration(lecture.durationSeconds),
        coverImageUrl: series.coverImageUrl,
        language: lecture.language,
        publishedAt: lecture.publishedAt ?? lecture.createdAt,
      })),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 8);

  const trendingLectures = recentLectures.slice(0, 3).map((lecture, index) => ({
    title: lecture.title,
    scholarName: lecture.scholarName,
    coverImageUrl: lecture.coverImageUrl,
    duration: lecture.duration,
    plays: [`12k plays`, `8.5k plays`, `7.2k plays`][index] ?? `6k plays`,
  }));

  return {
    scholars,
    featuredScholarName: featuredScholar.name,
    heroItems,
    recentLectures,
    trendingLectures,
  };
}

export async function HomeScreen() {
  const model = await loadHomeViewModel();
  const leadLecture = model.recentLectures[0] ?? null;

  return (
    <div className="pageRoot">
      <CatalogTopNav searchPlaceholder="Search for lectures, books, or scholars..." />
      <main className="shell">
        <HomeHero items={model.heroItems} />
        <HomeContentNav />

        <section className="section">
          <div className="sectionHead">
            <h2>Recently Added</h2>
          </div>
          <div className="mediaGrid">
            {model.recentLectures.slice(0, 4).map((lecture) => (
              <LectureMediaCard
                key={lecture.title}
                title={lecture.title}
                subtitle={lecture.scholarName}
                duration={lecture.duration}
                coverImageUrl={lecture.coverImageUrl}
                tag={lecture.language}
              />
            ))}
          </div>
        </section>

        {leadLecture ? (
          <NowPlayingBar
            title={leadLecture.title}
            scholar={leadLecture.scholarName}
            progressPercent={42}
          />
        ) : null}

        <section className="section">
          <div className="sectionHead">
            <h2>Eminent Scholars</h2>
            <div className="sectionActions" aria-hidden="true">
              <Button variant="surface" size="icon" aria-disabled="true" aria-label="Previous">
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>
              <Button variant="surface" size="icon" aria-disabled="true" aria-label="Next">
                <ChevronRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="scholarsRow">
            {model.scholars.slice(0, 8).map((scholar) => (
              <ScholarAvatarCard
                key={scholar.id}
                name={scholar.name}
                subtitle="Published"
                featured={scholar.name === model.featuredScholarName}
              />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2>Trending Now</h2>
            <div className="autoUpdateNote" aria-hidden="true">
              Auto-update in 5m
              <span className="autoUpdateIcon" aria-hidden="true">
                <RefreshCw size={16} aria-hidden="true" />
              </span>
            </div>
          </div>
          <div className="mediaGrid-trending">
            {model.trendingLectures.slice(0, 3).map((lecture, index) => (
              <TrendingCard
                key={lecture.title}
                rank={index + 1}
                title={lecture.title}
                scholarName={lecture.scholarName}
                plays={lecture.plays}
                coverImageUrl={lecture.coverImageUrl}
              />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2>New Arrivals</h2>
          </div>
          <div className="mediaGrid">
            {model.recentLectures.slice(4, 8).map((lecture) => (
              <LectureMediaCard
                key={`${lecture.title}-recent`}
                title={lecture.title}
                subtitle={lecture.scholarName}
                duration={lecture.duration}
                coverImageUrl={lecture.coverImageUrl}
                tag={lecture.language}
              />
            ))}
          </div>
        </section>

        <p className="metaNote">Featured instructor: {model.featuredScholarName}</p>
      </main>

      <CatalogFooter />
    </div>
  );
}
