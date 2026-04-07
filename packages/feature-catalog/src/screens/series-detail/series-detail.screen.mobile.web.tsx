"use client";

import { useSeriesDetailScreen } from "../../hooks/use-series-detail";

export type SeriesDetailMobileWebScreenProps = {
  id: string;
  onNavigateToLecture?: (id: string) => void;
};

export function SeriesDetailMobileWebScreen({
  id,
  onNavigateToLecture,
}: SeriesDetailMobileWebScreenProps) {
  const { series, isFetching } = useSeriesDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading series...</div>;
  }

  if (!series) {
    return <div style={{ padding: 16 }}>Series not found</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {series.coverImageUrl && (
        <img
          src={series.coverImageUrl}
          alt={series.title}
          style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
        />
      )}
      <h1 style={{ marginTop: 12, fontSize: 22 }}>{series.title}</h1>
      {series.description && <p style={{ color: "#666", fontSize: 14 }}>{series.description}</p>}
      <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
        {series.publishedLectureCount} lectures
      </div>
    </div>
  );
}
