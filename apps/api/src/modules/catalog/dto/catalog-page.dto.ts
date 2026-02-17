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

export class CollectionCatalogPageDto {
  @ApiProperty({ description: 'Items on this page', isArray: true })
  items!: Record<string, unknown>[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}

export class SeriesCatalogPageDto {
  @ApiProperty({ description: 'Items on this page', isArray: true })
  items!: Record<string, unknown>[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}

export class LectureCatalogPageDto {
  @ApiProperty({ description: 'Items on this page', isArray: true })
  items!: Record<string, unknown>[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}
