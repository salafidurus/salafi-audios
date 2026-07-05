import { createZodDto } from 'nestjs-zod';
import { SaveSeriesTranslationDtoSchema } from '@sd/core-contracts';

export class SaveSeriesTranslationDto extends createZodDto(SaveSeriesTranslationDtoSchema) {}
