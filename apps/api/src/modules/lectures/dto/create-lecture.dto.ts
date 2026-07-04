import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateLectureSchema = z.object({
  title: z.string().min(1, 'Title must not be empty'),
  slug: z.string().optional(),
  scholarId: z.string().min(1, 'Scholar ID must not be empty'),
  seriesId: z.string().optional(),
  topics: z.array(z.string()).optional(),
  audioKey: z.string().min(1, 'Audio key must not be empty'),
  format: z.string().optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
});

export class CreateLectureDto extends createZodDto(CreateLectureSchema) {}
