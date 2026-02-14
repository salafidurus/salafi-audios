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
  cursor?: string;
  source?:
    | {
        kind: "kibar";
      }
    | {
        kind: "topic";
        topicSlug: string;
      };
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
