import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AudioRepository } from './audio.repo';

/** NestJS audio progress flush job service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** audio application module responsible for audio progress flush.job behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AudioProgressFlushJob {
  constructor(private readonly repo: AudioRepository) {}

  @Cron('*/15 * * * * *')
  async run(): Promise<void> {
    await this.repo.flushBufferedProgress();
  }
}
