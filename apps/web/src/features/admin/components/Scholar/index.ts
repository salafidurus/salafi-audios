import { ScholarItem } from "./ScholarItem";
import type { ScholarItemProps } from "./ScholarItem";
import { ScholarModal } from "./ScholarModal";
import type { ScholarModalProps, ScholarForEdit } from "./ScholarModal";

export const Scholar = Object.assign(
  {},
  {
    Modal: ScholarModal,
    Item: ScholarItem,
  },
);

export type { ScholarItemProps, ScholarModalProps, ScholarForEdit };
