import type { ScholarTitle } from "@sd/core-contracts";

/** Documents this module's responsibility and public boundary. */
/** Localized display labels for the scholar title values in the shared contract. */
export const SCHOLAR_TITLE_LABELS = {
  allamah: "Allamah",
  sheikh: "Shaykh",
  ustadh: "Ustadh",
  akh: "Akh",
} satisfies Record<ScholarTitle, string>;

/** Ordered scholar title values used to build the admin title selector. */
export const SCHOLAR_TITLES_ARRAY = ["allamah", "sheikh", "ustadh", "akh"] satisfies ScholarTitle[];
