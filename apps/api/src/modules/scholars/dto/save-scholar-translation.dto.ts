import { createZodDto } from 'nestjs-zod';
import { SaveScholarTranslationDtoSchema } from '@sd/core-contracts';

/** scholars application module responsible for save scholar translation.dto behavior at the backend boundary. */
/** NestJS save scholar translation dto service or controller coordinating the API boundary for this responsibility. */
export class SaveScholarTranslationDto extends createZodDto(SaveScholarTranslationDtoSchema) {}
