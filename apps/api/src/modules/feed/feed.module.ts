import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepo } from './feed.repo';

@Module({
  controllers: [FeedController],
  providers: [FeedService, FeedRepo],
})
export class FeedModule {}
