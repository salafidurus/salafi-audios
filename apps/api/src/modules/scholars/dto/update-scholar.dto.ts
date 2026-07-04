import { createZodDto } from 'nestjs-zod';
import { CreateScholarSchema } from './create-scholar.dto';

export const UpdateScholarSchema = CreateScholarSchema.partial();

export class UpdateScholarDto extends createZodDto(UpdateScholarSchema) {}
