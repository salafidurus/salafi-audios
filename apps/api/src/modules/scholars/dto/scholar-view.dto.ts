import { ApiProperty } from '@nestjs/swagger';

export class ScholarViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string;

  @ApiProperty()
  isActive!: boolean;
}
