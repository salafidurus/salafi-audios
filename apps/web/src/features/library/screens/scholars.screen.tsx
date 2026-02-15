import type { Metadata } from "next";
import { publicApi } from "@/features/home/api/public-api";
import { EntityCard } from "@/features/library/components/cards/entity/entity-card";
import { CardGrid } from "@/features/library/components/cards/grid/grid";
import { Preferences } from "@/features/library/components/controls/preferences/preferences.client";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { canonical } from "@/features/library/utils/seo";
import styles from "./scholars.screen.module.css";

export function getScholarsMetadata(): Metadata {
  return {
    title: "Scholars",
    description: "Browse active scholars in the published Salafi Durus library.",
    alternates: {
      canonical: canonical("/scholars"),
    },
  };
}

export async function ScholarsScreen() {
  const scholars = await (async () => {
    try {
      return await publicApi.listScholars();
    } catch {
      return [];
    }
  })();

  return (
    <Shell
      title="Scholars"
      subtitle="Browse active scholars and follow their collections, standalone series, and lectures."
    >
      <p className={styles.devNote}>Dev mode: the scholar directory is still in progress.</p>
      <Preferences />
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
    </Shell>
  );
}
