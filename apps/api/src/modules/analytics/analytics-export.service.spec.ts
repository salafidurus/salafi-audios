import { describe, expect, it, vi } from 'bun:test';
import { AnalyticsExportService } from './analytics-export.service';

const parameters = {
  activationWatermark: new Date('2026-09-07T00:00:00.000Z'),
  fromReceivedAt: new Date('2026-09-07T00:00:00.000Z'),
  toReceivedAt: new Date('2026-09-07T01:00:00.000Z'),
  formatVersion: 'raw-v1',
  datasetVersion: 'exposure-v1',
};

describe('AnalyticsExportService', () => {
  it('uploads and verifies a page before advancing its durable cursor', async () => {
    const repository = {
      ensureRun: vi.fn().mockResolvedValue({ id: 'run-1', nextPart: 0 }),
      claim: vi.fn().mockResolvedValue(true),
      readPage: vi
        .fn()
        .mockResolvedValueOnce({
          events: [{ eventId: 'event-1', receivedAt: new Date('2026-09-07T00:30:00.000Z') }],
          nextCursor: { eventId: 'event-1', receivedAt: new Date('2026-09-07T00:30:00.000Z') },
        })
        .mockResolvedValueOnce({ events: [] }),
      checkpoint: vi.fn(),
      complete: vi.fn(),
      fail: vi.fn(),
    };
    const storage = {
      writePart: vi.fn().mockResolvedValue({ key: 'part', sha256: 'hash', bytes: 10, rowCount: 1 }),
      writeManifest: vi.fn(),
    };
    const telemetry = { recordAnalyticsExport: vi.fn() };
    const service = new AnalyticsExportService(
      repository as never,
      storage as never,
      telemetry as never,
    );

    await service.exportRange(parameters);

    expect(storage.writePart).toHaveBeenCalled();
    expect(repository.checkpoint).toHaveBeenCalledWith(
      'run-1',
      { eventId: 'event-1', receivedAt: new Date('2026-09-07T00:30:00.000Z') },
      1,
    );
    expect(repository.complete).toHaveBeenCalled();
    expect(repository.fail).not.toHaveBeenCalled();
    expect(telemetry.recordAnalyticsExport).toHaveBeenLastCalledWith('completed');
  });

  it('does not start a concurrent export when the durable lease is held', async () => {
    const repository = {
      ensureRun: vi.fn().mockResolvedValue({ id: 'run-1', nextPart: 0 }),
      claim: vi.fn().mockResolvedValue(false),
    };
    const storage = { writePart: vi.fn() };
    const service = new AnalyticsExportService(
      repository as never,
      storage as never,
      { recordAnalyticsExport: vi.fn() } as never,
    );

    await service.exportRange(parameters);

    expect(storage.writePart).not.toHaveBeenCalled();
  });
});
