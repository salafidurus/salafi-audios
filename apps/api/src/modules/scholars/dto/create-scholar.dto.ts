import { createZodDto } from 'nestjs-zod';
import { CreateScholarDtoSchema } from '@sd/core-contracts';

export class CreateScholarDto extends createZodDto(CreateScholarDtoSchema) {}
