import { Module } from '@nestjs/common';
import { MyLibraryController } from './my-library.controller';
import { MyLibraryService } from './my-library.service';
import { MyLibraryRepository } from './my-library.repo';
import { ListingModule } from '../listing/listing.module';
import { AnalyticsModule } from '../analytics/analytics.module';

/** my library application module responsible for my library.module behavior at the backend boundary. */
@Module({
  imports: [ListingModule, AnalyticsModule],
  controllers: [MyLibraryController],
  providers: [MyLibraryService, MyLibraryRepository],
  exports: [MyLibraryService],
})
/** NestJS my library module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class MyLibraryModule {}
