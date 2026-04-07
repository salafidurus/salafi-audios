"use client";

import { useCollectionDetailScreen } from "../../hooks/use-collection-detail";

export type CollectionDetailDesktopWebScreenProps = {
  id: string;
  onNavigateToSeries?: (id: string) => void;
};

export function CollectionDetailDesktopWebScreen({
  id,
  onNavigateToSeries,
}: CollectionDetailDesktopWebScreenProps) {
  const { collection, isFetching } = useCollectionDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading collection...</div>;
  }

  if (!collection) {
    return <div style={{ padding: 32 }}>Collection not found</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      {collection.coverImageUrl && (
        <img
          src={collection.coverImageUrl}
          alt={collection.title}
          style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }}
        />
      )}
      <h1 style={{ marginTop: 16, fontSize: 28 }}>{collection.title}</h1>
      {collection.description && <p style={{ color: "#666" }}>{collection.description}</p>}
      <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
        {collection.publishedLectureCount} lectures
      </div>
    </div>
  );
}
