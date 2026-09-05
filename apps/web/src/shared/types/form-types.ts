/** Shared status helpers used by the web listing editor. */
import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";

/** Status type for lectures sourced from the shared API contract. */
/** Status values accepted by the web listing form and shared API contract. */
export type LectureStatus = StatusValue;

/** Validates an external status value and returns the supplied safe fallback. */
export function validateLectureStatus(
  value: string,
  fallback: LectureStatus = "draft",
): LectureStatus {
  const parsed = StatusValueSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
