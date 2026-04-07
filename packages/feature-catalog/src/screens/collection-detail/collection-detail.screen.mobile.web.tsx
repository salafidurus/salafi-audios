"use client";

import { useCollectionDetailScreen } from "../../hooks/use-collection-detail";

export type CollectionDetailMobileWebScreenProps = {
  id: string;
  onNavigateToSeries?: (id: string) => void;
};

export function CollectionDetailMobileWebScreen({
  id,
  onNavigateToSeries,
}: CollectionDetailMobileWebScreenProps) {
  const { collection, isFetching } = useCollectionDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading collection...</div>;
  }

  if (!collection) {
    return <div style={{ padding: 16 }}>Collection not found</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {collection.coverImageUrl && (
        <img
          src={collection.coverImageUrl}
          alt={collection.title}
          style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
        />
      )}
      <h1 style={{ marginTop: 12, fontSize: 22 }}>{collection.title}</h1>
      {collection.description && (
        <p style={{ color: "#666", fontSize: 14 }}>{collection.description}</p>
      )}
      <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
        {collection.publishedLectureCount} lectures
      </div>
    </div>
  );
}
