export type ScholarChipDto = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type ContentSuggestionDto = {
  id: string;
  title: string;
  slug: string;
  kind: "lecture" | "series" | "collection";
  scholarName: string;
  scholarSlug: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
};

export type RecentProgressDto = {
  lectureId: string;
  lectureTitle: string;
  lectureSlug: string;
  scholarName: string;
  durationSeconds: number;
  positionSeconds: number;
};

export type QuickBrowseDto = {
  scholars: ScholarChipDto[];
  suggestions: ContentSuggestionDto[];
  recentProgress: RecentProgressDto | null;
};
