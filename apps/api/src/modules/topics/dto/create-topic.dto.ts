import { createZodDto } from 'nestjs-zod';
import { CreateTopicWithTranslationsDtoSchema } from '@sd/core-contracts';

/** topics application module responsible for create topic.dto behavior at the backend boundary. */
/** NestJS create topic dto service or controller coordinating the API boundary for this responsibility. */
export class CreateTopicDto extends createZodDto(CreateTopicWithTranslationsDtoSchema) {}
