import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LocaleSchema } from '@sd/core-contracts';

export const SaveScholarTranslationSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, 'Name must not be empty'),
  bio: z.string().nullable().optional(),
});

export class SaveScholarTranslationDto extends createZodDto(SaveScholarTranslationSchema) {}
