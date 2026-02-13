import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogApi, CatalogApiError } from "@/features/catalog/api/catalog-public.api";
import { CardGrid } from "@/features/catalog/components/cards/card-grid";
import { EntityCard } from "@/features/catalog/components/cards/entity-card";
import { CatalogShell } from "@/features/catalog/components/layout/catalog-shell";
import { SectionBlock } from "@/features/catalog/components/layout/section-block";
import { EmptyState } from "@/features/catalog/components/states/empty-state";
import { canonical } from "@/features/catalog/utils/catalog-seo";

type CollectionPageData = {
  scholar: Awaited<ReturnType<typeof catalogApi.getScholar>>;
  collection: Awaited<ReturnType<typeof catalogApi.getScholarCollection>>;
  series: Awaited<ReturnType<typeof catalogApi.listCollectionSeries>>;
};

type CollectionRouteProps = {
  params: Promise<{ scholarSlug: string; collectionSlug: string }>;
};

async function loadCollectionPage(
  scholarSlug: string,
  collectionSlug: string,
): Promise<CollectionPageData> {
  try {
    const [scholar, collection, series] = await Promise.all([
      catalogApi.getScholar(scholarSlug),
      catalogApi.getScholarCollection(scholarSlug, collectionSlug),
      catalogApi.listCollectionSeries(scholarSlug, collectionSlug),
    ]);

    return { scholar, collection, series };
  } catch (error) {
    if (error instanceof CatalogApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getCollectionMetadata({ params }: CollectionRouteProps): Promise<Metadata> {
  const { scholarSlug, collectionSlug } = await params;

  try {
    const collection = await catalogApi.getScholarCollection(scholarSlug, collectionSlug);
    return {
      title: collection.title,
      description: collection.description ?? `Collection by ${scholarSlug}.`,
      alternates: { canonical: canonical(`/collections/${scholarSlug}/${collectionSlug}`) },
    };
  } catch {
    return {
      title: "Collection",
      alternates: { canonical: canonical(`/collections/${scholarSlug}/${collectionSlug}`) },
    };
  }
}

export async function CollectionDetailScreen({ params }: CollectionRouteProps) {
  const { scholarSlug, collectionSlug } = await params;
  const { scholar, collection, series } = await loadCollectionPage(scholarSlug, collectionSlug);

  return (
    <CatalogShell
      title={collection.title}
      subtitle={collection.description ?? undefined}
      breadcrumbs={[
        { href: `/scholars/${scholarSlug}`, label: scholar.name },
        { href: `/collections/${scholarSlug}/${collectionSlug}`, label: collection.title },
      ]}
    >
      <SectionBlock title="Series">
        {series.length === 0 ? (
          <EmptyState message="No published series found in this collection." />
        ) : (
          <CardGrid>
            {series.map((item: CollectionPageData["series"][number]) => (
              <EntityCard
                key={item.id}
                href={`/series/${scholarSlug}/${item.slug}`}
                title={item.title}
                description={item.description}
                meta={item.language}
              />
            ))}
          </CardGrid>
        )}
      </SectionBlock>
    </CatalogShell>
  );
}
