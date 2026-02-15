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

  @ApiProperty()
  createdAt!: string; // ISO

  @ApiProperty({ required: false, nullable: true })
  updatedAt?: string; // ISO
}
