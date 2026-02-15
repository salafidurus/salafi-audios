export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) {
    return "-";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainder}s`;
  }

  return `${remainder}s`;
}

export function formatDate(iso?: string): string {
  if (!iso) {
    return "-";
  }

  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
