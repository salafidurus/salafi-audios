import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateScholarSchema = z.object({
  name: z.string().min(1, 'Name must not be empty'),
  slug: z.string().min(1, 'Slug must not be empty'),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  isKibar: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export class CreateScholarDto extends createZodDto(CreateScholarSchema) {}
