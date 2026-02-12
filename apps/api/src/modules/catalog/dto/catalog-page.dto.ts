import { ApiProperty } from '@nestjs/swagger';
import { CollectionViewDto } from '@/modules/collections/dto/collection-view.dto';
import { LectureViewDto } from '@/modules/lectures/dto/lecture-view.dto';
import { SeriesViewDto } from '@/modules/series/dto/series-view.dto';

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
  @ApiProperty({
    description: 'Items on this page',
    type: () => [CollectionViewDto],
  })
  items!: CollectionViewDto[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}

export class SeriesCatalogPageDto {
  @ApiProperty({
    description: 'Items on this page',
    type: () => [SeriesViewDto],
  })
  items!: SeriesViewDto[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}

export class LectureCatalogPageDto {
  @ApiProperty({
    description: 'Items on this page',
    type: () => [LectureViewDto],
  })
  items!: LectureViewDto[];

  @ApiProperty({
    description: 'Next cursor if more results exist',
    required: false,
    type: String,
  })
  nextCursor?: string;
}
