import { createZodDto } from 'nestjs-zod';
import { UpdateTopicWithTranslationsDtoSchema } from '@sd/core-contracts';

export class UpdateTopicDto extends createZodDto(UpdateTopicWithTranslationsDtoSchema) {}
