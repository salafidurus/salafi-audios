import { createZodDto } from 'nestjs-zod';
import { UpdateLivestreamChannelDtoSchema } from '@sd/core-contracts';

export class UpdateLivestreamChannelDto extends createZodDto(UpdateLivestreamChannelDtoSchema) {}
