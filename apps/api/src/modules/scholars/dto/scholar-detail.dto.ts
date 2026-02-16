import { ApiProperty } from '@nestjs/swagger';

export class ScholarDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string;

  @ApiProperty({ required: false, nullable: true })
  country?: string;

  @ApiProperty({ required: false, nullable: true })
  mainLanguage?: string;

  @ApiProperty({ required: false, nullable: true })
  imageUrl?: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isKibar!: boolean;

  @ApiProperty({ required: false, nullable: true })
  socialTwitter?: string;

  @ApiProperty({ required: false, nullable: true })
  socialTelegram?: string;

  @ApiProperty({ required: false, nullable: true })
  socialYoutube?: string;

  @ApiProperty({ required: false, nullable: true })
  socialWebsite?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ required: false, nullable: true })
  updatedAt?: string;
}
