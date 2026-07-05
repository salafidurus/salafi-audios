import { createZodDto } from 'nestjs-zod';
import { CreateCollectionDtoSchema } from '@sd/core-contracts';

export class CreateCollectionDto extends createZodDto(CreateCollectionDtoSchema) {}
