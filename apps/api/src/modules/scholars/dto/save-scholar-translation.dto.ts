import {
  SaveScholarTranslationDtoSchema,
  type SaveScholarTranslationDto as SaveScholarTranslationDtoType,
} from '@sd/core-contracts';

/** Request contract for creating or replacing a scholar translation in one locale. */
export { SaveScholarTranslationDtoSchema };
/** Fields accepted by the scholar-translation write endpoint. */
export type SaveScholarTranslationDto = SaveScholarTranslationDtoType;
