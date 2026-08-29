import {
  UpdateScholarTranslationDtoSchema,
  type UpdateScholarTranslationDto as UpdateScholarTranslationDtoType,
} from '@sd/core-contracts';

/** Request contract for partially updating a scholar translation in one locale. */
export { UpdateScholarTranslationDtoSchema };
/** Optional translation fields accepted by the scholar-translation update endpoint. */
export type UpdateScholarTranslationDto = UpdateScholarTranslationDtoType;
