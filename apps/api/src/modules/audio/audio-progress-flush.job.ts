import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AudioRepository } from './audio.repo';

@Injectable()
export class AudioProgressFlushJob {
  constructor(private readonly repo: AudioRepository) {}

  @Cron('*/15 * * * * *')
  async run(): Promise<void> {
    await this.repo.flushBufferedProgress();
  }
}
