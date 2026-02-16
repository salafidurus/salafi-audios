import { ApiProperty } from '@nestjs/swagger';

export class ScholarStatsDto {
  @ApiProperty({ description: 'Total number of series by this scholar' })
  seriesCount!: number;

  @ApiProperty({ description: 'Total number of lectures by this scholar' })
  lecturesCount!: number;

  @ApiProperty({
    description: 'Total number of followers (computed from analytics)',
  })
  followerCount!: number;
}
