import { createZodDto } from 'nestjs-zod';
import { CreateTopicWithTranslationsDtoSchema } from '@sd/core-contracts';

export class CreateTopicDto extends createZodDto(CreateTopicWithTranslationsDtoSchema) {}
