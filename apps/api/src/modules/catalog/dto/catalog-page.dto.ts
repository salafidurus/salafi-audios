import { ApiProperty } from '@nestjs/swagger';

export class CatalogPageDto<TItem> {
  @ApiProperty({ description: 'Items on this page', isArray: true })
  items!: TItem[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
  })
  nextCursor?: string;
}
