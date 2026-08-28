import { createZodDto } from 'nestjs-zod';
import { UpdateScholarDtoSchema } from '@sd/core-contracts';

/** scholars application module responsible for update scholar.dto behavior at the backend boundary. */
/** NestJS update scholar dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateScholarDto extends createZodDto(UpdateScholarDtoSchema) {}
