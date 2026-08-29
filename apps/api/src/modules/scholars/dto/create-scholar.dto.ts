import {
  CreateScholarDtoSchema,
  type CreateScholarDto as CreateScholarDtoType,
} from '@sd/core-contracts';

/** Request contract for creating a scholar and its main-language profile. */
export { CreateScholarDtoSchema };
/** Fields accepted by the scholar creation endpoint. */
export type CreateScholarDto = CreateScholarDtoType;
