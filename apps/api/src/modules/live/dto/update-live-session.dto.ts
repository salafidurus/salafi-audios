import { createZodDto } from 'nestjs-zod';
import { UpdateLiveSessionDtoSchema } from '@sd/core-contracts';

export class UpdateLiveSessionDto extends createZodDto(UpdateLiveSessionDtoSchema) {}
