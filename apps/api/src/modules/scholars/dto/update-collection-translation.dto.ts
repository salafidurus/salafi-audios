import { createZodDto } from 'nestjs-zod';
import { UpdateCollectionTranslationDtoSchema } from '@sd/core-contracts';

export class UpdateCollectionTranslationDto extends createZodDto(
  UpdateCollectionTranslationDtoSchema,
) {}
