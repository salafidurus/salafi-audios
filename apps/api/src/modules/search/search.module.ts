import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repo';
import { SearchService } from './search.service';

/** search application module responsible for search.module behavior at the backend boundary. */
@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
})
/** NestJS search module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class SearchModule {}
