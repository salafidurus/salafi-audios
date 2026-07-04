import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpsertTopicSchema = z.object({
  slug: z.string().min(1, 'Slug must not be empty'),
  name: z.string().min(1, 'Name must not be empty'),
  parentSlug: z.string().optional(),
});

export class UpsertTopicDto extends createZodDto(UpsertTopicSchema) {}
