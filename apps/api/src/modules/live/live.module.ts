import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { AdminLiveController } from './admin-live.controller';
import { LiveService } from './live.service';
import { LiveRepository } from './live.repo';

@Module({
  controllers: [LiveController, AdminLiveController],
  providers: [LiveService, LiveRepository],
  exports: [LiveService],
})
export class LiveModule {}
