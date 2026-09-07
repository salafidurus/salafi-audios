import { describe, expect, it } from 'bun:test';
import {
  buildExportParameterHash,
  compareExportCursor,
  isResumableExportRun,
  type AnalyticsExportParameters,
} from './analytics-export.types';

const parameters: AnalyticsExportParameters = {
  activationWatermark: new Date('2026-09-07T00:00:00.000Z'),
  fromReceivedAt: new Date('2026-09-07T00:00:00.000Z'),
  toReceivedAt: new Date('2026-09-08T00:00:00.000Z'),
  formatVersion: 'raw-v1',
  datasetVersion: 'exposure-v1',
};

describe('analytics export invariants', () => {
  it('hashes immutable parameters independently of object key order', () => {
    expect(buildExportParameterHash(parameters)).toBe(
      buildExportParameterHash({
        datasetVersion: 'exposure-v1',
        formatVersion: 'raw-v1',
        toReceivedAt: new Date('2026-09-08T00:00:00.000Z'),
        fromReceivedAt: new Date('2026-09-07T00:00:00.000Z'),
        activationWatermark: new Date('2026-09-07T00:00:00.000Z'),
      }),
    );
    expect(buildExportParameterHash({ ...parameters, datasetVersion: 'exposure-v2' })).not.toBe(
      buildExportParameterHash(parameters),
    );
  });

  it('orders received-at/event-id cursors deterministically', () => {
    expect(
      compareExportCursor(
        { receivedAt: new Date('2026-09-07T00:00:00.000Z'), eventId: 'a' },
        { receivedAt: new Date('2026-09-07T00:00:00.000Z'), eventId: 'b' },
      ),
    ).toBeLessThan(0);
    expect(
      compareExportCursor(
        { receivedAt: new Date('2026-09-07T00:01:00.000Z'), eventId: 'a' },
        { receivedAt: new Date('2026-09-07T00:00:00.000Z'), eventId: 'z' },
      ),
    ).toBeGreaterThan(0);
  });

  it('resumes only when persisted parameters match exactly', () => {
    expect(
      isResumableExportRun({ parameterHash: buildExportParameterHash(parameters) }, parameters),
    ).toBe(true);
    expect(
      isResumableExportRun(
        { parameterHash: buildExportParameterHash(parameters) },
        { ...parameters, toReceivedAt: new Date('2026-09-09T00:00:00.000Z') },
      ),
    ).toBe(false);
  });
});
