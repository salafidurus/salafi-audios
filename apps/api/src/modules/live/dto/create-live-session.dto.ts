import { createZodDto } from 'nestjs-zod';
import { CreateLiveSessionDtoSchema } from '@sd/core-contracts';

export class CreateLiveSessionDto extends createZodDto(CreateLiveSessionDtoSchema) {
  channelId!: string;
  title?: string;
  scheduledAt?: string;
  telegramMsgId?: string;
}
