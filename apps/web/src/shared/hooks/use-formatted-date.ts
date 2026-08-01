import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns a date formatted consistently for SSR.
 * Uses a fixed locale and timezone to ensure server and client render identically.
 * Returns the formatted date only after hydration to prevent hydration mismatches.
 */
export function useFormattedDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      // Client snapshot: format with browser's locale
      const d = new Date(date);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      });
    },
    () => {
      // Server snapshot: format with fixed locale to prevent mismatch
      const d = new Date(date);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      });
    },
  );
}
