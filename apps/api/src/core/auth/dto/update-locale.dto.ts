import {
  UpdateLocaleDtoSchema,
  type UpdateLocaleDto as UpdateLocaleDtoType,
} from '@sd/core-contracts';

/** Shared schema used to validate and document the preferred-language update body. */
export { UpdateLocaleDtoSchema };

/** Type of the validated preferred-language update body. */
export type UpdateLocaleDto = UpdateLocaleDtoType;
