import {
  ArrangeCommitDtoSchema,
  type ArrangeCommitDto as ArrangeCommitDtoType,
} from '@sd/core-contracts';

/** Defines the validated request contract for atomic listing tree edits. */
export { ArrangeCommitDtoSchema };
/** Atomic tree-edit payload used to arrange a listing's nested content. */
export type ArrangeCommitDto = ArrangeCommitDtoType;
