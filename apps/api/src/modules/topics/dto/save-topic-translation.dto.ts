import { createZodDto } from 'nestjs-zod';
import { SaveTopicTranslationDtoSchema } from '@sd/core-contracts';

/** topics application module responsible for save topic translation.dto behavior at the backend boundary. */
/** NestJS save topic translation dto service or controller coordinating the API boundary for this responsibility. */
export class SaveTopicTranslationDto extends createZodDto(SaveTopicTranslationDtoSchema) {}
