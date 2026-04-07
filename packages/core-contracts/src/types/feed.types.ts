export type FeedItemDto = {
  id: string;
  lectureId: string;
  lectureTitle: string;
  lectureSlug: string;
  scholarId: string;
  scholarSlug: string;
  scholarName: string;
  seriesTitle?: string;
  collectionTitle?: string;
  durationSeconds?: number;
  publishedAt: string;
};

export type FeedPageDto = {
  items: FeedItemDto[];
  nextCursor?: string;
  hasMore: boolean;
};
