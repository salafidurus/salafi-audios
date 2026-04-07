"use client";

import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";

export type ScholarDetailMobileWebScreenProps = {
  slug: string;
  onNavigateToCollection?: (id: string) => void;
  onNavigateToSeries?: (id: string) => void;
};

export function ScholarDetailMobileWebScreen({
  slug,
  onNavigateToCollection,
  onNavigateToSeries,
}: ScholarDetailMobileWebScreenProps) {
  const { scholar, stats, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading scholar...</div>;
  }

  if (!scholar) {
    return <div style={{ padding: 16 }}>Scholar not found</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {scholar.imageUrl && (
          <img
            src={scholar.imageUrl}
            alt={scholar.name}
            style={{ width: 80, height: 80, borderRadius: 40, objectFit: "cover" }}
          />
        )}
        <h1 style={{ margin: "8px 0 0", fontSize: 22 }}>{scholar.name}</h1>
        {scholar.bio && <p style={{ color: "#666", fontSize: 14 }}>{scholar.bio}</p>}
        {stats && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              fontSize: 13,
              color: "#888",
            }}
          >
            <span>{stats.seriesCount} series</span>
            <span>{stats.lecturesCount} lectures</span>
          </div>
        )}
      </div>
    </div>
  );
}
