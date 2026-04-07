"use client";

import { useSeriesDetailScreen } from "../../hooks/use-series-detail";

export type SeriesDetailDesktopWebScreenProps = {
  id: string;
  onNavigateToLecture?: (id: string) => void;
};

export function SeriesDetailDesktopWebScreen({
  id,
  onNavigateToLecture,
}: SeriesDetailDesktopWebScreenProps) {
  const { series, isFetching } = useSeriesDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading series...</div>;
  }

  if (!series) {
    return <div style={{ padding: 32 }}>Series not found</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      {series.coverImageUrl && (
        <img
          src={series.coverImageUrl}
          alt={series.title}
          style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }}
        />
      )}
      <h1 style={{ marginTop: 16, fontSize: 28 }}>{series.title}</h1>
      {series.description && <p style={{ color: "#666" }}>{series.description}</p>}
      <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
        {series.publishedLectureCount} lectures
      </div>
    </div>
  );
}
