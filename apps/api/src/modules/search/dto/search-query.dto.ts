import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  language: z.string().optional(),
  topicSlug: z.string().optional(),
  topicSlugs: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string()))
    .optional(),
  scholarSlug: z.string().optional(),
  limit: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().int().min(1).max(30))
    .optional(),
});

export class SearchQueryDto extends createZodDto(SearchQuerySchema) {}
