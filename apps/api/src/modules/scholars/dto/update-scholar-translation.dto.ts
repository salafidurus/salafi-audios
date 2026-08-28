import { createZodDto } from 'nestjs-zod';
import { UpdateScholarTranslationDtoSchema } from '@sd/core-contracts';

/** scholars application module responsible for update scholar translation.dto behavior at the backend boundary. */
/** NestJS update scholar translation dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateScholarTranslationDto extends createZodDto(UpdateScholarTranslationDtoSchema) {}
