import { createZodDto } from 'nestjs-zod';
import { CreateScholarDtoSchema } from '@sd/core-contracts';

/** scholars application module responsible for create scholar.dto behavior at the backend boundary. */
/** NestJS create scholar dto service or controller coordinating the API boundary for this responsibility. */
export class CreateScholarDto extends createZodDto(CreateScholarDtoSchema) {}
