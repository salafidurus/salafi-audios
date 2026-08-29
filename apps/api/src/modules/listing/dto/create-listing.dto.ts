import {
  CreateListingDtoSchema,
  type CreateListingDto as CreateListingDtoType,
} from '@sd/core-contracts';

/** Defines the validated request contract for creating catalog listings. */
export { CreateListingDtoSchema };
/** Fields accepted when creating a catalog listing and its primary media. */
export type CreateListingDto = CreateListingDtoType;
