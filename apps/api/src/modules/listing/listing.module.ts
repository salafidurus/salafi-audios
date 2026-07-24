import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { AdminListingsController } from './admin-listings.controller';
import { ListingTranslationsController } from './listing-translations.controller';
import { ListingService } from './listing.service';
import { ListingRepository } from './listing.repo';
import { RecentListingsRepo } from './listing-recent.repo';

@Module({
  controllers: [ListingController, AdminListingsController, ListingTranslationsController],
  providers: [ListingService, ListingRepository, RecentListingsRepo],
  exports: [ListingService, ListingRepository],
})
export class ListingModule {}
