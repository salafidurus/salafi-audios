export type RecommendationKind = "lecture" | "series" | "collection";

export type RecommendationItem = {
  id: string;
  kind: RecommendationKind;
  title: string;
  subtitle: string;
  href: string;
  coverImageUrl?: string;
  meta?: string;
};

export type RecommendationRow = {
  id: string;
  title: string;
  items: RecommendationItem[];
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
