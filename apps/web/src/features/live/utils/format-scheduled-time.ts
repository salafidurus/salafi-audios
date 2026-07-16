export function formatScheduledTime(dateStr: string): string {
  const date = new Date(dateStr);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const timePart = date.toLocaleTimeString("en-US", timeOptions);
  const datePart = date.toLocaleDateString("en-US", dateOptions);
  return `${timePart} · ${datePart}`;
}
