import { createZodDto } from 'nestjs-zod';
import { UpdateScholarDtoSchema } from '@sd/core-contracts';

export class UpdateScholarDto extends createZodDto(UpdateScholarDtoSchema) {
  name?: string;
  slug?: string;
  bio?: string;
  imageUrl?: string;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}
