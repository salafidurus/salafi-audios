import { describe, expect, it, vi } from 'bun:test';
import { AudioProgressFlushJob } from './audio-progress-flush.job';

describe('AudioProgressFlushJob', () => {
  it('delegates flushing to AudioRepository', async () => {
    const repo = { flushBufferedProgress: vi.fn().mockResolvedValue(undefined) };
    await new AudioProgressFlushJob(repo as any).run();
    expect(repo.flushBufferedProgress).toHaveBeenCalledTimes(1);
  });
});
