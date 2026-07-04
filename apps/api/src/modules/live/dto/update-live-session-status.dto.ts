import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LiveSessionStatusSchema } from '@sd/core-contracts';

export const UpdateLiveSessionStatusSchema = z.object({
  status: LiveSessionStatusSchema,
});

export class UpdateLiveSessionStatusDto extends createZodDto(UpdateLiveSessionStatusSchema) {}
