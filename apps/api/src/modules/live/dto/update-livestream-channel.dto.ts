import { createZodDto } from 'nestjs-zod';
import { UpdateLivestreamChannelDtoSchema, type Locale } from '@sd/core-contracts';

export class UpdateLivestreamChannelDto extends createZodDto(UpdateLivestreamChannelDtoSchema) {
  telegramSlug?: string;
  displayName?: string;
  language?: Locale;
  isActive?: boolean;
  scholarId?: string;
}
