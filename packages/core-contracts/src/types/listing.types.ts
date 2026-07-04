/**
 * A **Listing** is any top-level, browsable content unit — the thing users
 * discover via search/feed and the scholar Catalog. Every Listing has one of
 * three formats:
 *
 *   - `collection` — a curated group of Series.
 *   - `series`     — a standalone Series (a course of Lessons).
 *   - `single`     — a standalone Lecture (a one-off talk).
 *
 * Nested content is never a Listing: a Series inside a Collection is a
 * **Module**, and a Lecture inside a Series/Module is a **Lesson**. Those are
 * surfaced only for grouping and progress, not as discovery entry points.
 *
 * See `docs/nomenclature.md` for the full two-axis model.
 */
export type ListingFormat = "collection" | "series" | "single";

/**
 * Resolution result from GET /listing/:id.
 * Returns the content format and ID so the client can render the
 * appropriate detail screen (each screen fetches its own data).
 */
export type ListingViewDto = {
  format: ListingFormat;
  id: string;
};
