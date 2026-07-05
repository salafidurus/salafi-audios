import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { AdminListingsController } from './admin-listings.controller';
import { ListingTranslationsController } from './listing-translations.controller';
import { ListingService } from './listing.service';
import { ListingRepository } from './listing.repo';

@Module({
  controllers: [ListingController, AdminListingsController, ListingTranslationsController],
  providers: [ListingService, ListingRepository],
  exports: [ListingService, ListingRepository],
})
export class ListingModule {}
