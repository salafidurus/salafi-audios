import { createZodDto } from 'nestjs-zod';
import { UpdateSeriesTranslationDtoSchema } from '@sd/core-contracts';

export class UpdateSeriesTranslationDto extends createZodDto(UpdateSeriesTranslationDtoSchema) {}
