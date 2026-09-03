/** Track-type module defining the resolved unit consumed by Listening playback. */
/** Resolved playable unit associated with a Listing or its child content. */
export type Track = {
  /** Stable content identity used for playback and progress association. */
  id: string;
  /** Listing slug used as the client-facing progress identity. */
  slug: string;
  /** Display title for the playable unit. */
  title: string;
  /** Scholar name presented with the track. */
  artist: string; // scholar name
  /** Scholar identity used to resolve display context. */
  scholarSlug?: string; // used to resolve the scholar's honorific title for display
  /** Stream URL or device-local file URI. */
  url: string; // stream URL or local file path URI
  /** Track duration in seconds when known. */
  durationSeconds: number;
  /** Listing artwork, with the scholar image used as the display fallback. */
  artworkUrl?: string;
  /** Scholar avatar used when the listing has no artwork. */
  scholarImageUrl?: string | null;
  orderIndex?: number;
  /** Series identity, set only for a standalone Series. */
  seriesId?: string | null; // set only for a standalone Series (never for a Module)
  seriesTitle?: string | null;
  collectionId?: string | null;
  moduleId?: string | null; // set for a Lesson nested in a Collection's Module
  moduleTitle?: string | null;
};
