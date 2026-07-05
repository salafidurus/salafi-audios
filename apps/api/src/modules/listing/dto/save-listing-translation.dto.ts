import { createZodDto } from 'nestjs-zod';
import { SaveListingTranslationDtoSchema } from '@sd/core-contracts';

export class SaveListingTranslationDto extends createZodDto(SaveListingTranslationDtoSchema) {}
