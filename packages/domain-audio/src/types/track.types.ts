export type Track = {
  id: string;
  title: string;
  artist: string; // scholar name
  scholarSlug?: string; // used to resolve the scholar's honorific title for display
  url: string; // stream URL or local file path URI
  durationSeconds: number;
  artworkUrl?: string;
  seriesId?: string | null;
  seriesTitle?: string | null;
  collectionId?: string | null;
};
