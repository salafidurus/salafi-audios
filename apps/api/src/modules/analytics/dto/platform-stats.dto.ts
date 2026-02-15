import { ApiProperty } from '@nestjs/swagger';

export class PlatformStatsDto {
  @ApiProperty({ description: 'Total number of active scholars' })
  totalScholars!: number;

  @ApiProperty({ description: 'Total number of published lectures' })
  totalLectures!: number;

  @ApiProperty({
    description: 'Number of lectures published in the last 30 days',
  })
  lecturesPublishedLast30Days!: number;
}
