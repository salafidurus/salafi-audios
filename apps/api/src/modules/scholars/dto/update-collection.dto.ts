import { createZodDto } from 'nestjs-zod';
import { UpdateCollectionDtoSchema } from '@sd/core-contracts';

export class UpdateCollectionDto extends createZodDto(UpdateCollectionDtoSchema) {}
