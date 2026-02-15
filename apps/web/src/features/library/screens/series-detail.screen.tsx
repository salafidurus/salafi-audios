import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi, PublicApiError } from "@/features/home/api/public-api";
import { tryGetWebEnv } from "@/shared/utils/env";
import { CardGrid } from "@/features/library/components/cards/grid/grid";
import { LectureCard } from "@/features/library/components/cards/lecture-card";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { SectionBlock } from "@/features/library/components/layout/section-block/section-block";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { canonical } from "@/features/library/utils/seo";

type SeriesPageData = {
  scholar: Awaited<ReturnType<typeof publicApi.getScholar>>;
  series: Awaited<ReturnType<typeof publicApi.getScholarSeries>>;
  lectures: Awaited<ReturnType<typeof publicApi.listSeriesLectures>>;
};

type SeriesRouteProps = {
  params: Promise<{ scholarSlug: string; seriesSlug: string }>;
};

async function loadSeriesPage(scholarSlug: string, seriesSlug: string): Promise<SeriesPageData> {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, series, lectures] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.getScholarSeries(scholarSlug, seriesSlug),
      publicApi.listSeriesLectures(scholarSlug, seriesSlug),
    ]);

    return { scholar, series, lectures };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    notFound();
  }
}

export async function getSeriesMetadata({ params }: SeriesRouteProps): Promise<Metadata> {
  const { scholarSlug, seriesSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Series",
      alternates: { canonical: canonical(`/series/${scholarSlug}/${seriesSlug}`) },
    };
  }

  try {
    const series = await publicApi.getScholarSeries(scholarSlug, seriesSlug);
    return {
      title: series.title,
      description: series.description ?? `Series by ${scholarSlug}.`,
      alternates: { canonical: canonical(`/series/${scholarSlug}/${seriesSlug}`) },
    };
  } catch {
    return {
      title: "Series",
      alternates: { canonical: canonical(`/series/${scholarSlug}/${seriesSlug}`) },
    };
  }
}

export async function SeriesDetailScreen({ params }: SeriesRouteProps) {
  const { scholarSlug, seriesSlug } = await params;
  const { scholar, series, lectures } = await loadSeriesPage(scholarSlug, seriesSlug);

  return (
    <Shell
      title={series.title}
      subtitle={series.description ?? undefined}
      breadcrumbs={[
        { href: `/scholars/${scholarSlug}`, label: scholar.name },
        { href: `/series/${scholarSlug}/${seriesSlug}`, label: series.title },
      ]}
    >
      <SectionBlock title="Lectures">
        {lectures.length === 0 ? (
          <EmptyState message="No published lectures found in this series." />
        ) : (
          <CardGrid>
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                href={`/lectures/${scholarSlug}/${lecture.slug}`}
                title={lecture.title}
                description={lecture.description}
                published={lecture.publishedAt?.slice(0, 10)}
              />
            ))}
          </CardGrid>
        )}
      </SectionBlock>
    </Shell>
  );
}
