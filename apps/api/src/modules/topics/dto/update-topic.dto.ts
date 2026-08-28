import { createZodDto } from 'nestjs-zod';
import { UpdateTopicWithTranslationsDtoSchema } from '@sd/core-contracts';

/** topics application module responsible for update topic.dto behavior at the backend boundary. */
/** NestJS update topic dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateTopicDto extends createZodDto(UpdateTopicWithTranslationsDtoSchema) {}
