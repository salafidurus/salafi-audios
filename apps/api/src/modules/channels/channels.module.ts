import { Module } from '@nestjs/common';
import { ChannelsRepository } from './channels.repo';
import { ChannelsService } from './channels.service';

@Module({
  providers: [ChannelsService, ChannelsRepository],
  exports: [ChannelsService],
})
export class ChannelsModule {}
