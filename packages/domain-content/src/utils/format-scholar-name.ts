import type { ScholarTitle } from "@sd/core-contracts";
import { useScholarsList } from "../scholar.api";

export interface ScholarWithNameAndTitle {
  name: string;
  title?: ScholarTitle | string | null;
}

const SCHOLAR_TITLE_DISPLAY: Record<ScholarTitle, string> = {
  allamah: "Shaykh Allamah",
  sheikh: "Sheikh",
  ustadh: "Ustadh",
  akh: "Akh",
};

/**
 * Format a scholar's name with their honorific title prefix.
 *
 * Examples:
 * - formatScholarName({ name: "Salih al-Fawzan", title: "sheikh" }) => "Sheikh Salih al-Fawzan"
 * - formatScholarName("Muhammad Nasiruddin al-Albani", "allamah") => "Shaykh Allamah Muhammad Nasiruddin al-Albani"
 */
export function formatScholarName(
  scholar?: ScholarWithNameAndTitle | string | null,
  titleParam?: ScholarTitle | string | null,
): string {
  if (!scholar) return "";

  const name = typeof scholar === "string" ? scholar : scholar.name;
  const title = typeof scholar === "string" ? titleParam : scholar.title;

  if (!name) return "";
  if (!title) return name;

  const prefix = SCHOLAR_TITLE_DISPLAY[title as ScholarTitle];
  if (!prefix) return name;

  if (name.startsWith(prefix)) return name;

  return `${prefix} ${name}`;
}

/**
 * React hook to format a scholar name, resolving title from cache if omitted.
 */
export function useFormattedScholarName(
  scholarName?: string | null,
  titleParam?: ScholarTitle | string | null,
): string {
  const { data } = useScholarsList();

  if (!scholarName) return "";

  if (titleParam) {
    return formatScholarName(scholarName, titleParam);
  }

  const foundScholar = data?.scholars?.find(
    (s) => s.name === scholarName || formatScholarName(s.name, s.title) === scholarName,
  );

  if (foundScholar?.title) {
    return formatScholarName(scholarName, foundScholar.title);
  }

  return scholarName;
}
