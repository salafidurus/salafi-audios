"use client";

import { useFormattedDate } from "@/shared/hooks/use-formatted-date";

export function FormattedDate({
  date,
  options,
}: {
  date: string | Date | number;
  options?: Intl.DateTimeFormatOptions;
}) {
  const formatted = useFormattedDate(date, options);
  return <span>{formatted}</span>;
}
