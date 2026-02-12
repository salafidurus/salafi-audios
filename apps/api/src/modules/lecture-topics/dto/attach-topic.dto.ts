import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AttachTopicDto {
  @ApiProperty({
    example: 'tawheed',
    description: 'Topic slug to attach',
  })
  @IsString()
  @IsNotEmpty()
  topicSlug!: string;
}
