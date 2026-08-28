import type { ScholarTitle } from "@sd/core-contracts";

/** Documents this module's responsibility and public boundary. */
export const SCHOLAR_TITLE_LABELS = {
  allamah: "Allamah",
  sheikh: "Shaykh",
  ustadh: "Ustadh",
  akh: "Akh",
} satisfies Record<ScholarTitle, string>;

export const SCHOLAR_TITLES_ARRAY = ["allamah", "sheikh", "ustadh", "akh"] satisfies ScholarTitle[];
