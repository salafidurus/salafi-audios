import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi, PublicApiError } from "@/features/home/api/public-api";
import { tryGetWebEnv } from "@/shared/utils/env";
import { CardGrid } from "@/features/library/components/cards/grid/grid";
import { EntityCard } from "@/features/library/components/cards/entity/entity-card";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { SectionBlock } from "@/features/library/components/layout/section-block/section-block";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { canonical } from "@/features/library/utils/seo";

type ScholarPageData = {
  scholar: Awaited<ReturnType<typeof publicApi.getScholar>>;
  collections: Awaited<ReturnType<typeof publicApi.listScholarCollections>>;
  standaloneSeries: Awaited<ReturnType<typeof publicApi.listScholarSeries>>;
};

type ScholarRouteProps = {
  params: Promise<{ scholarSlug: string }>;
};

async function loadScholarPage(scholarSlug: string): Promise<ScholarPageData> {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, collections, series] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.listScholarCollections(scholarSlug),
      publicApi.listScholarSeries(scholarSlug),
    ]);

    return {
      scholar,
      collections,
      standaloneSeries: series.filter(
        (item: Awaited<ReturnType<typeof publicApi.listScholarSeries>>[number]) =>
          !item.collectionId,
      ),
    };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }

    // Treat non-404 errors (including missing API env) as not-found for build/runtime resilience.
    notFound();
  }
}

export async function getScholarMetadata({ params }: ScholarRouteProps): Promise<Metadata> {
  const { scholarSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }

  try {
    const scholar = await publicApi.getScholar(scholarSlug);
    return {
      title: scholar.name,
      description: scholar.bio ?? `Published library for ${scholar.name}.`,
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  } catch {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }
}

export async function ScholarDetailScreen({ params }: ScholarRouteProps) {
  const { scholarSlug } = await params;
  const { scholar, collections, standaloneSeries } = await loadScholarPage(scholarSlug);

  return (
    <Shell title={scholar.name} subtitle={scholar.bio ?? undefined}>
      <SectionBlock title="Collections">
        {collections.length === 0 ? (
          <EmptyState message="This scholar has no published collections." />
        ) : (
          <CardGrid>
            {collections.map((collection) => (
              <EntityCard
                key={collection.id}
                href={`/collections/${scholar.slug}/${collection.slug}`}
                title={collection.title}
                description={collection.description}
                meta={collection.language}
              />
            ))}
          </CardGrid>
        )}
      </SectionBlock>

      <SectionBlock title="Standalone Series">
        {standaloneSeries.length === 0 ? (
          <EmptyState message="This scholar has no standalone published series." />
        ) : (
          <CardGrid>
            {standaloneSeries.map((series) => (
              <EntityCard
                key={series.id}
                href={`/series/${scholar.slug}/${series.slug}`}
                title={series.title}
                description={series.description}
                meta={series.language}
              />
            ))}
          </CardGrid>
        )}
      </SectionBlock>
    </Shell>
  );
}
