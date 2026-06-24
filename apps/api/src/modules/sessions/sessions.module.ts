import { Module } from '@nestjs/common';
import { LiveModule } from '../live/live.module';
import { SessionsRepository } from './sessions.repo';
import { SessionsService } from './sessions.service';

@Module({
  imports: [LiveModule],
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
