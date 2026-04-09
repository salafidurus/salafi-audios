import { IsIn } from 'class-validator';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';

export class UpdateLocaleDto {
  @IsIn(SUPPORTED_LOCALES)
  preferredLanguage!: 'en' | 'ar';
}
