import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";

// Status type for lectures — sourced from the shared backend contract so the
// web form can't silently drift out of sync with the API's status enum.
/** Documents this module's responsibility and public boundary. */
export type LectureStatus = StatusValue;

export function validateLectureStatus(
  value: string,
  fallback: LectureStatus = "draft",
): LectureStatus {
  const parsed = StatusValueSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
