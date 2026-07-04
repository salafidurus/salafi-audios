import { createZodDto } from 'nestjs-zod';
import { UpdateLiveSessionDtoSchema, type LiveSessionStatus } from '@sd/core-contracts';

export class UpdateLiveSessionDto extends createZodDto(UpdateLiveSessionDtoSchema) {
  title?: string;
  scheduledAt?: string;
  status?: LiveSessionStatus;
  telegramMsgId?: string;
  viewerCount?: number;
}
