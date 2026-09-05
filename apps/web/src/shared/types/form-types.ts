import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";

// Status type for lectures — sourced from the shared backend contract so the
// web form can't silently drift out of sync with the API's status enum.
/** Documents this module's responsibility and public boundary. */
/** Status values accepted by the lecture form and shared API contract. */
export type LectureStatus = StatusValue;

/** Parses an arbitrary status value and falls back to draft when it is invalid. */
export function validateLectureStatus(
  value: string,
  fallback: LectureStatus = "draft",
): LectureStatus {
  const parsed = StatusValueSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
