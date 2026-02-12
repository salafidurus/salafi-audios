import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopicDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  createdAt!: string;
}
