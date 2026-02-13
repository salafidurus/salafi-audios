import type { Metadata } from "next";
import { catalogApi } from "@/features/catalog/api/catalog-public.api";
import { NowPlayingBar } from "@/features/catalog/components/audio/now-playing-bar";
import { LectureMediaCard } from "@/features/catalog/components/cards/lecture-media-card";
import { ScholarAvatarCard } from "@/features/catalog/components/cards/scholar-avatar-card";
import { CatalogFooter } from "@/features/catalog/components/layout/catalog-footer";
import { CatalogTopNav } from "@/features/catalog/components/navigation/catalog-top-nav";
import "./home.css";
import { formatDuration } from "@/features/catalog/utils/catalog-format";
import { canonical } from "@/features/catalog/utils/catalog-seo";

type HomeViewModel = {
  scholars: Awaited<ReturnType<typeof catalogApi.listScholars>>;
  featuredScholarName: string;
  featuredSeries: {
    title: string;
    description?: string;
    coverImageUrl?: string;
  } | null;
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
  const scholars = await catalogApi.listScholars();

  if (scholars.length === 0) {
    return {
      scholars: [],
      featuredScholarName: "Salafi Durus",
      featuredSeries: null,
      recentLectures: [],
      trendingLectures: [],
    };
  }

  const scholarSeriesBundles = await Promise.all(
    scholars.slice(0, 6).map(async (scholar) => ({
      scholar,
      series: await catalogApi.listScholarSeries(scholar.slug),
    })),
  );

  const featuredBundle = scholarSeriesBundles.find((bundle) => bundle.series.length > 0) ?? null;
  const featuredScholar = featuredBundle?.scholar ?? scholars[0];
  const featuredSeriesCandidate = featuredBundle?.series[0] ?? null;

  const lectureSourceSeries = scholarSeriesBundles
    .flatMap((bundle) =>
      bundle.series.slice(0, 2).map((series) => ({ scholar: bundle.scholar, series })),
    )
    .slice(0, 8);

  const lectureGroups = await Promise.all(
    lectureSourceSeries.map(async ({ scholar, series }) => ({
      scholar,
      series,
      lectures: await catalogApi.listSeriesLectures(scholar.slug, series.slug),
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
    featuredSeries: featuredSeriesCandidate
      ? {
          title: featuredSeriesCandidate.title,
          description: featuredSeriesCandidate.description,
          coverImageUrl: featuredSeriesCandidate.coverImageUrl,
        }
      : null,
    recentLectures,
    trendingLectures,
  };
}

export async function HomeScreen() {
  const model = await loadHomeViewModel();
  const leadLecture = model.recentLectures[0] ?? null;

  return (
    <main className="shell">
      <CatalogTopNav searchPlaceholder="Search for lectures, books, or scholars..." />

      <section
        className="hero"
        style={
          model.featuredSeries?.coverImageUrl
            ? { backgroundImage: `url(${model.featuredSeries.coverImageUrl})` }
            : undefined
        }
      >
        <span className="heroPill">Featured Series</span>
        <h1 className="heroTitle">
          {model.featuredSeries?.title ?? "Begin your learning journey"}
        </h1>
        <p className="heroCopy">
          {model.featuredSeries?.description ??
            "Explore published lectures organized by scholars, collections, and thematic series."}
        </p>
        <span className="heroCtaDisabled">Start Learning</span>
      </section>

      <section className="section">
        <div className="sectionHead">
          <h2>New Arrivals</h2>
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
          <h2>Recently Added</h2>
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

      <CatalogFooter />

      <p className="metaNote">Featured instructor: {model.featuredScholarName}</p>
    </main>
  );
}
