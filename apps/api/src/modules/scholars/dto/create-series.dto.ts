import { createZodDto } from 'nestjs-zod';
import { CreateSeriesDtoSchema } from '@sd/core-contracts';

export class CreateSeriesDto extends createZodDto(CreateSeriesDtoSchema) {}
