import { ApiProperty } from '@nestjs/swagger';

export class TopicViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
}
