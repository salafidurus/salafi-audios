import { createZodDto } from 'nestjs-zod';
import { UpdateScholarDtoSchema } from '@sd/core-contracts';

export class UpdateScholarDto extends createZodDto(UpdateScholarDtoSchema) {}
