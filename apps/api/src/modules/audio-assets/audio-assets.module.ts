import { Module } from '@nestjs/common';
import { DbModule } from '../../core/db/db.module';
import { ListingModule } from '../listing/listing.module';
import { AudioAssetsRepository } from './audio-assets.repo';
import { AudioAssetsService } from './audio-assets.service';
import { AdminAudioAssetsController } from './admin-audio-assets.controller';

@Module({
  imports: [DbModule, ListingModule],
  providers: [AudioAssetsRepository, AudioAssetsService],
  controllers: [AdminAudioAssetsController],
  exports: [AudioAssetsService],
})
export class AudioAssetsModule {}
