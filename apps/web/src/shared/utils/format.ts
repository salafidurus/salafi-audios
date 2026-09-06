/**
 * Converts playback seconds into the compact hours/minutes label used by
 * catalog metadata. Fractional seconds are truncated, seconds are omitted,
 * and missing, non-positive, or sub-minute values return an empty label.
 *
 * @param durationSeconds - Duration in seconds; non-positive and missing values produce an empty label.
 * @returns A short hours-and-minutes or minutes-only label, or an empty string when no label is useful.
 */
export function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) {
    return "";
  }
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes <= 0) {
    return "";
  }
  return `${minutes}m`;
}
