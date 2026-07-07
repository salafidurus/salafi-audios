import { createZodDto } from 'nestjs-zod';
import { CreateLivestreamChannelDtoSchema } from '@sd/core-contracts';

export class CreateLivestreamChannelDto extends createZodDto(CreateLivestreamChannelDtoSchema) {}
