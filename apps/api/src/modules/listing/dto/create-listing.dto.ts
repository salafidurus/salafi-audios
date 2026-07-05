import { createZodDto } from 'nestjs-zod';
import { CreateListingDtoSchema } from '@sd/core-contracts';

export class CreateListingDto extends createZodDto(CreateListingDtoSchema) {}
