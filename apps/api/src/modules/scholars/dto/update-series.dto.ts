import { createZodDto } from 'nestjs-zod';
import { UpdateSeriesDtoSchema } from '@sd/core-contracts';

export class UpdateSeriesDto extends createZodDto(UpdateSeriesDtoSchema) {}
