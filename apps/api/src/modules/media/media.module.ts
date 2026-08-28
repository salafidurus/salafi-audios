import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

/** media application module responsible for media.module behavior at the backend boundary. */
@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
/** NestJS media module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class MediaModule {}
