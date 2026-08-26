/**
 * Formats a duration in seconds into a human-readable string (e.g. "1hr 05m", "42m").
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
