export type Track = {
  id: string;
  title: string;
  artist: string; // scholar name
  url: string; // stream URL or local file path URI
  durationSeconds: number;
  artworkUrl?: string;
  seriesId?: string | null;
  seriesTitle?: string | null;
};

export type AudioSource = {
  listingId: string;
  streamUrl: string;
  localUri?: string;
};
