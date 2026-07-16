import { ScholarItem, type ScholarItemProps } from "./ScholarItem";
import { ScholarModal, type ScholarModalProps, type ScholarForEdit } from "./ScholarModal";

export const Scholar = Object.assign(
  {},
  {
    Modal: ScholarModal,
    Item: ScholarItem,
  },
);

export type { ScholarItemProps, ScholarModalProps, ScholarForEdit };
