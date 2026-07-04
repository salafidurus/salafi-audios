import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LocaleSchema } from '@sd/core-contracts';

export const SaveTopicTranslationSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, 'Name must not be empty'),
});

export class SaveTopicTranslationDto extends createZodDto(SaveTopicTranslationSchema) {}
