/**
 * Converts a positive duration to the compact playback-label format used by the web UI.
 *
 * Zero, negative, missing, and sub-minute durations intentionally return an empty string
 * so callers can omit a label when there is no useful minute-level value to display.
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
