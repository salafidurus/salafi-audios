import { createZodDto } from 'nestjs-zod';
import { CreateLivestreamChannelDtoSchema, type Locale } from '@sd/core-contracts';

export class CreateLivestreamChannelDto extends createZodDto(CreateLivestreamChannelDtoSchema) {
  telegramId!: string;
  telegramSlug?: string;
  displayName!: string;
  language?: Locale;
  scholarId?: string;
}
