import { createZodDto } from 'nestjs-zod';
import { CreateLivestreamChannelDtoSchema, type Locale } from '@sd/core-contracts';

export class CreateLivestreamChannelDto extends createZodDto(CreateLivestreamChannelDtoSchema) {}
