import type { ScholarTitle } from "@sd/core-contracts";

export const SCHOLAR_TITLE_LABELS: Record<ScholarTitle, string> = {
  allamah: "Allamah",
  sheikh: "Sheikh",
  ustadh: "Ustadh",
  akh: "Akh",
};

export const SCHOLAR_TITLES_ARRAY = Object.keys(SCHOLAR_TITLE_LABELS) as ScholarTitle[];
