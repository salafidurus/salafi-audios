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

type CollectionPageData = {
  scholar: Awaited<ReturnType<typeof publicApi.getScholar>>;
  collection: Awaited<ReturnType<typeof publicApi.getScholarCollection>>;
  series: Awaited<ReturnType<typeof publicApi.listCollectionSeries>>;
};

type CollectionRouteProps = {
  params: Promise<{ scholarSlug: string; collectionSlug: string }>;
};

async function loadCollectionPage(
  scholarSlug: string,
  collectionSlug: string,
): Promise<CollectionPageData> {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, collection, series] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.getScholarCollection(scholarSlug, collectionSlug),
      publicApi.listCollectionSeries(scholarSlug, collectionSlug),
    ]);

    return { scholar, collection, series };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    notFound();
  }
}

export async function getCollectionMetadata({ params }: CollectionRouteProps): Promise<Metadata> {
  const { scholarSlug, collectionSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Collection",
      alternates: { canonical: canonical(`/collections/${scholarSlug}/${collectionSlug}`) },
    };
  }

  try {
    const collection = await publicApi.getScholarCollection(scholarSlug, collectionSlug);
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
    <Shell
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
    </Shell>
  );
}
