import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogApi, CatalogApiError } from "@/features/catalog/api/catalog-public.api";
import { CardGrid } from "@/features/catalog/components/cards/card-grid";
import { LectureCard } from "@/features/catalog/components/cards/lecture-card";
import { CatalogShell } from "@/features/catalog/components/layout/catalog-shell";
import { SectionBlock } from "@/features/catalog/components/layout/section-block";
import { EmptyState } from "@/features/catalog/components/states/empty-state";
import { canonical } from "@/features/catalog/utils/catalog-seo";

type SeriesRouteProps = {
  params: Promise<{ scholarSlug: string; seriesSlug: string }>;
};

async function loadSeriesPage(scholarSlug: string, seriesSlug: string) {
  try {
    const [scholar, series, lectures] = await Promise.all([
      catalogApi.getScholar(scholarSlug),
      catalogApi.getScholarSeries(scholarSlug, seriesSlug),
      catalogApi.listSeriesLectures(scholarSlug, seriesSlug),
    ]);

    return { scholar, series, lectures };
  } catch (error) {
    if (error instanceof CatalogApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getSeriesMetadata({ params }: SeriesRouteProps): Promise<Metadata> {
  const { scholarSlug, seriesSlug } = await params;

  try {
    const series = await catalogApi.getScholarSeries(scholarSlug, seriesSlug);
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
    <CatalogShell
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
    </CatalogShell>
  );
}
