import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { SUPPORTED_LOCALES } from '@sd/core-i18n';

export class SaveTopicTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES })
  @IsIn(SUPPORTED_LOCALES)
  locale!: 'en' | 'ar';

  @ApiProperty()
  @IsString()
  name!: string;
}
