import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogApi, CatalogApiError } from "@/features/catalog/api/catalog-public.api";
import { CardGrid } from "@/features/catalog/components/cards/card-grid";
import { EntityCard } from "@/features/catalog/components/cards/entity-card";
import { CatalogShell } from "@/features/catalog/components/layout/catalog-shell";
import { SectionBlock } from "@/features/catalog/components/layout/section-block";
import { EmptyState } from "@/features/catalog/components/states/empty-state";
import { canonical } from "@/features/catalog/utils/catalog-seo";

type ScholarRouteProps = {
  params: Promise<{ scholarSlug: string }>;
};

async function loadScholarPage(scholarSlug: string) {
  try {
    const [scholar, collections, series] = await Promise.all([
      catalogApi.getScholar(scholarSlug),
      catalogApi.listScholarCollections(scholarSlug),
      catalogApi.listScholarSeries(scholarSlug),
    ]);

    return {
      scholar,
      collections,
      standaloneSeries: series.filter((item) => !item.collectionId),
    };
  } catch (error) {
    if (error instanceof CatalogApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getScholarMetadata({ params }: ScholarRouteProps): Promise<Metadata> {
  const { scholarSlug } = await params;

  try {
    const scholar = await catalogApi.getScholar(scholarSlug);
    return {
      title: scholar.name,
      description: scholar.bio ?? `Published catalog for ${scholar.name}.`,
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
    <CatalogShell title={scholar.name} subtitle={scholar.bio ?? undefined}>
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
    </CatalogShell>
  );
}
