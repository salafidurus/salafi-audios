import { createZodDto } from 'nestjs-zod';
import { UpdateLiveSessionStatusDtoSchema } from '@sd/core-contracts';

export class UpdateLiveSessionStatusDto extends createZodDto(UpdateLiveSessionStatusDtoSchema) {}
