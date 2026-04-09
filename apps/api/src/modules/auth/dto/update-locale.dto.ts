import { IsIn } from 'class-validator';
import { SUPPORTED_LOCALES } from '@sd/core-i18n';

export class UpdateLocaleDto {
  @IsIn(SUPPORTED_LOCALES)
  preferredLanguage!: 'en' | 'ar';
}
