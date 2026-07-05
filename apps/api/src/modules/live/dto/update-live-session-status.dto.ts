import { createZodDto } from 'nestjs-zod';
import { UpdateLiveSessionStatusDtoSchema, LiveSessionStatusSchema } from '@sd/core-contracts';

export class UpdateLiveSessionStatusDto extends createZodDto(UpdateLiveSessionStatusDtoSchema) {}
