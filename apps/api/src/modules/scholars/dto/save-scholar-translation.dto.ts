import { createZodDto } from 'nestjs-zod';
import { SaveScholarTranslationDtoSchema } from '@sd/core-contracts';

export class SaveScholarTranslationDto extends createZodDto(SaveScholarTranslationDtoSchema) {}
