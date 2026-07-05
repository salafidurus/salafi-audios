import { createZodDto } from 'nestjs-zod';
import { SaveCollectionTranslationDtoSchema } from '@sd/core-contracts';

export class SaveCollectionTranslationDto extends createZodDto(
  SaveCollectionTranslationDtoSchema,
) {}
