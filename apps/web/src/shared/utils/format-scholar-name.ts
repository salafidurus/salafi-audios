import type { ScholarTitle } from "@sd/core-contracts";

const SCHOLAR_TITLE_DISPLAY: Record<ScholarTitle, string> = {
  allamah: "Shaykh Allamah",
  sheikh: "Sheikh",
  ustadh: "Ustadh",
  akh: "Akh",
};

export function formatScholarName(scholar: { name: string; title?: ScholarTitle | null }): string {
  if (!scholar.title) return scholar.name;
  return `${SCHOLAR_TITLE_DISPLAY[scholar.title]} ${scholar.name}`;
}
