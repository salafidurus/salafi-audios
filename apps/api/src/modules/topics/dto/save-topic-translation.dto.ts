import { createZodDto } from 'nestjs-zod';
import { SaveTopicTranslationDtoSchema } from '@sd/core-contracts';

export class SaveTopicTranslationDto extends createZodDto(SaveTopicTranslationDtoSchema) {}
