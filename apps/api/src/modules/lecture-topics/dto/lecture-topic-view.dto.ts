import { ApiProperty } from '@nestjs/swagger';
import type { TopicViewDto } from '@sd/core-contracts';

export class LectureTopicViewDto {
  @ApiProperty({ description: 'The attached topic' })
  topic!: TopicViewDto;

  @ApiProperty({
    description: 'When the topic was attached to the lecture (ISO)',
  })
  attachedAt!: string;
}
