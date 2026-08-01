import { Module } from '@nestjs/common';
import { DbModule } from '../../core/db/db.module';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { AudioRepository } from './audio.repo';

@Module({
  imports: [DbModule],
  controllers: [AudioController],
  providers: [AudioService, AudioRepository],
  exports: [AudioService],
})
export class AudioModule {}
