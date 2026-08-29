import {
  SaveListingTranslationDtoSchema,
  type SaveListingTranslationDto as SaveListingTranslationDtoType,
} from '@sd/core-contracts';

/** Request contract for creating or replacing a listing translation in one locale. */
export { SaveListingTranslationDtoSchema };
/** Fields accepted by the listing-translation write endpoint. */
export type SaveListingTranslationDto = SaveListingTranslationDtoType;
