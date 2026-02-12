import { Module } from '@nestjs/common';
import { AudioAssetsController } from './audio-assets.controller';
import { AudioAssetsService } from './audio-assets.service';
import { AudioAssetsRepository } from './audio-assets.repo';

@Module({
  controllers: [AudioAssetsController],
  providers: [AudioAssetsService, AudioAssetsRepository],
  exports: [AudioAssetsService, AudioAssetsRepository],
})
export class AudioAssetsModule {}
