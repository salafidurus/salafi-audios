"use client";

import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";

export type ScholarDetailDesktopWebScreenProps = {
  slug: string;
  onNavigateToCollection?: (id: string) => void;
  onNavigateToSeries?: (id: string) => void;
};

export function ScholarDetailDesktopWebScreen({
  slug,
  onNavigateToCollection,
  onNavigateToSeries,
}: ScholarDetailDesktopWebScreenProps) {
  const { scholar, stats, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading scholar...</div>;
  }

  if (!scholar) {
    return <div style={{ padding: 32 }}>Scholar not found</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        {scholar.imageUrl && (
          <img
            src={scholar.imageUrl}
            alt={scholar.name}
            style={{ width: 120, height: 120, borderRadius: 60, objectFit: "cover" }}
          />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>{scholar.name}</h1>
          {scholar.bio && <p style={{ color: "#666", marginTop: 8 }}>{scholar.bio}</p>}
          {stats && (
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 14, color: "#888" }}>
              <span>{stats.seriesCount} series</span>
              <span>{stats.lecturesCount} lectures</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
