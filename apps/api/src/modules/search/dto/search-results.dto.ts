import { ApiProperty } from '@nestjs/swagger';

export class SearchResultsDto {
  @ApiProperty({ description: 'Matching collections', isArray: true })
  collections!: Record<string, unknown>[];

  @ApiProperty({ description: 'Matching series', isArray: true })
  series!: Record<string, unknown>[];

  @ApiProperty({ description: 'Matching lectures', isArray: true })
  lectures!: Record<string, unknown>[];
}
