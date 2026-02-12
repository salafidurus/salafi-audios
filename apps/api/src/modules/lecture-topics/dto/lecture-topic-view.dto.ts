import { ApiProperty } from '@nestjs/swagger';
import { TopicViewDto } from './topic-view.dto';

export class LectureTopicViewDto {
  @ApiProperty({ type: TopicViewDto })
  topic!: TopicViewDto;

  @ApiProperty({
    description: 'When the topic was attached to the lecture (ISO)',
  })
  attachedAt!: string;
}
