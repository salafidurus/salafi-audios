import { createZodDto } from 'nestjs-zod';
import { UpsertTopicDtoSchema } from '@sd/core-contracts';

export class UpsertTopicDto extends createZodDto(UpsertTopicDtoSchema) {}
