import { ScholarItem, type ScholarItemProps } from "./ScholarItem";
import { ScholarModal, type ScholarModalProps } from "./ScholarModal";

/** Documents this module's responsibility and public boundary. */
/** Namespaced scholar components exported for the admin editor surface. */
export const Scholar = Object.assign(
  {},
  {
    Modal: ScholarModal,
    Item: ScholarItem,
  },
);

export type { ScholarItemProps, ScholarModalProps };
