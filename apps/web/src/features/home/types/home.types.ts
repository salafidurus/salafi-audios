export type RecommendationKind = "lecture" | "series" | "collection";

export type RecommendationItem = {
  id: string;
  kind: RecommendationKind;
  title: string;
  subtitle: string;
  href: string;
  coverImageUrl?: string;
  lessonCount?: number;
  totalDurationSeconds?: number;
  meta?: string;
};

export type RecommendationRow = {
  id: string;
  title: string;
  items: RecommendationItem[];
  variant?: "featured";
  density?: "tight" | "default";
  cursor?: string;
  source?:
    | { kind: "recommended-kibar" }
    | { kind: "recommended-recent-play" }
    | { kind: "recommended-topics"; topicsCsv?: string }
    | { kind: "following-scholars" }
    | { kind: "following-topics"; topicsCsv?: string }
    | { kind: "latest" }
    | { kind: "latest-topics"; topicsCsv?: string }
    | { kind: "popular" }
    | { kind: "popular-topics"; topicsCsv?: string };
};

export type Tab = {
  id: string;
  label: string;
  rows: RecommendationRow[];
};

export type Stats = {
  totalScholars: number;
  totalLectures: number;
  lecturesPublishedLast30Days: number;
};
