import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LocaleSchema } from '@sd/core-contracts';

export const SaveSeriesTranslationSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, 'Title must not be empty'),
  description: z.string().nullable().optional(),
});

export class SaveSeriesTranslationDto extends createZodDto(SaveSeriesTranslationSchema) {}
