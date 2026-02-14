import type { Metadata } from "next";
import { catalogApi } from "@/features/catalog/api/catalog-public.api";
import { EntityCard } from "@/features/catalog/components/cards/entity-card";
import { CardGrid } from "@/features/catalog/components/cards/card-grid";
import { CatalogPreferences } from "@/features/catalog/components/controls/catalog-preferences.client";
import { CatalogShell } from "@/features/catalog/components/layout/catalog-shell";
import { EmptyState } from "@/features/catalog/components/states/empty-state";
import { canonical } from "@/features/catalog/utils/catalog-seo";

export function getScholarsMetadata(): Metadata {
  return {
    title: "Scholars",
    description: "Browse active scholars in the published Salafi Durus catalog.",
    alternates: {
      canonical: canonical("/scholars"),
    },
  };
}

export async function ScholarsScreen() {
  const scholars = await (async () => {
    try {
      return await catalogApi.listScholars();
    } catch {
      return [];
    }
  })();

  return (
    <CatalogShell
      title="Scholars"
      subtitle="Browse active scholars and follow their collections, standalone series, and lectures."
    >
      <CatalogPreferences />
      {scholars.length === 0 ? (
        <EmptyState message="No scholars are published yet." />
      ) : (
        <CardGrid>
          {scholars.map((scholar) => (
            <EntityCard
              key={scholar.id}
              href={`/scholars/${scholar.slug}`}
              title={scholar.name}
              description={scholar.bio ?? undefined}
            />
          ))}
        </CardGrid>
      )}
    </CatalogShell>
  );
}
