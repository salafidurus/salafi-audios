import { createZodDto } from 'nestjs-zod';
import { CreateScholarDtoSchema } from '@sd/core-contracts';

export class CreateScholarDto extends createZodDto(CreateScholarDtoSchema) {
  name!: string;
  slug!: string;
  bio?: string;
  imageUrl?: string;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}
