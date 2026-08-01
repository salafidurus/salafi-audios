export type Track = {
  id: string;
  slug?: string;
  title: string;
  artist: string; // scholar name
  scholarSlug?: string; // used to resolve the scholar's honorific title for display
  url: string; // stream URL or local file path URI
  durationSeconds: number;
  artworkUrl?: string;
  orderIndex?: number;
  seriesId?: string | null; // set only for a standalone Series (never for a Module)
  seriesTitle?: string | null;
  collectionId?: string | null;
  moduleId?: string | null; // set for a Lesson nested in a Collection's Module
  moduleTitle?: string | null;
};
