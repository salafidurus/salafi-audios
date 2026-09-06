import { describe, expect, it, vi } from 'bun:test';
import { AnalyticsDispatchService } from './analytics-dispatch.service';

const baseIntent = {
  eventId: 'event-1',
  eventName: 'user_registered',
  subjectId: 'user-1',
  payload: {},
  attempts: 1,
  createdAt: new Date('2026-09-06T18:00:00.000Z'),
};

function createService(overrides: Record<string, unknown> = {}) {
  const intents = {
    claimDue: vi.fn().mockResolvedValue([baseIntent]),
    markDelivered: vi.fn().mockResolvedValue(undefined),
    markFailure: vi.fn().mockResolvedValue(undefined),
  };
  const archive = {
    append: vi.fn().mockResolvedValue({ accepted: ['event-1'], deduplicated: [] }),
  };
  const provider = {
    publish: vi.fn().mockResolvedValue({ accepted: ['event-1'], rejected: [], disabled: false }),
  };
  const telemetry = { recordAnalyticsDelivery: vi.fn() };
  const prisma = { listing: { findUnique: vi.fn() } };
  const config = {
    OTEL_DEPLOYMENT_VERSION: 'test-api',
    ANALYTICS_IDENTITY_HMAC_SECRET: 'test-secret',
    MIXPANEL_PROJECT_TOKEN: 'project-token',
    MIXPANEL_API_URL: 'https://api.mixpanel.com',
  };
  const service = new AnalyticsDispatchService(
    { ...intents, ...overrides } as any,
    archive as any,
    prisma as any,
    config as any,
    provider as any,
    telemetry as any,
  );
  return { service, intents, archive, prisma, provider, telemetry };
}

describe('AnalyticsDispatchService', () => {
  it('translates a durable registration intent and marks it delivered', async () => {
    const { service, intents, archive, provider, telemetry } = createService();

    await expect(service.dispatchDue()).resolves.toEqual({
      delivered: 1,
      retried: 0,
      deadLettered: 0,
    });

    expect(archive.append).toHaveBeenCalledWith([
      expect.objectContaining({
        event_id: 'event-1',
        event_name: 'user_registered',
        source: 'api',
        platform: 'api',
        authority: 'backend_confirmed',
        producer: 'api',
      }),
    ]);
    expect(intents.markDelivered).toHaveBeenCalledWith('event-1');
    expect(provider.publish).toHaveBeenCalledWith([
      expect.objectContaining({ event_id: 'event-1', event_name: 'user_registered' }),
    ]);
    expect(telemetry.recordAnalyticsDelivery).toHaveBeenCalledWith('delivered', expect.any(Number));
  });

  it('releases retryable archive failures with bounded retry metadata', async () => {
    const { service, intents, archive, provider, telemetry } = createService();
    archive.append.mockRejectedValue(new Error('analytics database unavailable'));

    await expect(service.dispatchDue()).resolves.toEqual({
      delivered: 0,
      retried: 1,
      deadLettered: 0,
    });

    expect(intents.markFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event-1',
        attempts: 1,
        maxAttempts: 5,
        error: 'analytics database unavailable',
        availableAt: expect.any(Date),
      }),
    );
    expect(provider.publish).not.toHaveBeenCalled();
    expect(telemetry.recordAnalyticsDelivery).toHaveBeenCalledWith('retry', expect.any(Number));
  });

  it('releases retryable provider failures without losing the archived event', async () => {
    const { service, intents, provider, archive, telemetry } = createService();
    provider.publish.mockRejectedValue(new Error('mixpanel_import_failed:503'));

    await expect(service.dispatchDue()).resolves.toEqual({
      delivered: 0,
      retried: 1,
      deadLettered: 0,
    });
    expect(archive.append).toHaveBeenCalled();
    expect(intents.markFailure).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'event-1', attempts: 1, maxAttempts: 5 }),
    );
    expect(telemetry.recordAnalyticsDelivery).toHaveBeenCalledWith('retry', expect.any(Number));
  });

  it('publishes all archive-ready claims as one bounded provider batch', async () => {
    const { service, intents, provider } = createService();
    intents.claimDue.mockResolvedValue([
      baseIntent,
      { ...baseIntent, eventId: 'event-2', subjectId: 'user-2' },
    ]);

    await expect(service.dispatchDue()).resolves.toEqual({
      delivered: 2,
      retried: 0,
      deadLettered: 0,
    });
    expect(provider.publish).toHaveBeenCalledWith([
      expect.objectContaining({ event_id: 'event-1' }),
      expect.objectContaining({ event_id: 'event-2' }),
    ]);
    expect(provider.publish).toHaveBeenCalledTimes(1);
  });

  it('dead-letters unsupported event names without retrying forever', async () => {
    const { service, intents } = createService();
    intents.claimDue.mockResolvedValue([{ ...baseIntent, eventName: 'unsupported_event' }]);

    await expect(service.dispatchDue()).resolves.toEqual({
      delivered: 0,
      retried: 0,
      deadLettered: 1,
    });

    expect(intents.markFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event-1',
        attempts: 5,
        maxAttempts: 5,
        availableAt: expect.any(Date),
      }),
    );
  });
});
