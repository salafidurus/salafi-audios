import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { AdminListingsController } from './admin-listings.controller';
import { ListingTranslationsController } from './listing-translations.controller';
import { ListingService } from './listing.service';
import { ListingRepository } from './listing.repo';
import { RecentListingsRepo } from './listing-recent.repo';
import { ListingEditorialService } from './listing-editorial.service';

/** listing application module responsible for listing.module behavior at the backend boundary. */
@Module({
  controllers: [ListingController, AdminListingsController, ListingTranslationsController],
  providers: [ListingService, ListingEditorialService, ListingRepository, RecentListingsRepo],
  exports: [ListingService, ListingRepository],
})
/** NestJS listing module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ListingModule {}
