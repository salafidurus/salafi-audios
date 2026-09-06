import { describe, expect, it, vi } from 'bun:test';
import { parseProductEvent, type CanonicalProductEvent } from '@sd/core-analytics';
import { AnalyticsService } from './analytics.service';

const event = (eventId: string, consentState: 'essential' | 'optional_denied') =>
  parseProductEvent({
    event_id: eventId,
    event_name: 'listing_viewed',
    schema_version: 'v1',
    occurred_at: '2026-09-06T12:00:00.000Z',
    source: 'web',
    platform: 'web',
    app_version: 'test',
    consent_state: consentState,
    identity: { type: 'anonymous', anonymous_id: 'anon-123' },
    event_context: {},
    content_references: { listing_slug: 'listing', scholar_slug: 'scholar' },
    priority: 'important',
    authority: 'client_observation',
    producer: 'web',
    properties: { listing_slug: 'listing', scholar_slug: 'scholar' },
  });

describe('AnalyticsService', () => {
  it('drops denied consent while preserving request order', async () => {
    const append = vi.fn().mockResolvedValue({ accepted: ['accepted'], deduplicated: [] });
    const recordAnalyticsStage = vi.fn();
    const service = new AnalyticsService(
      { append } as never,
      { ANALYTICS_IDENTITY_HMAC_SECRET: '01234567890123456789012345678901' } as never,
      { recordAnalyticsStage } as never,
    );

    await expect(
      service.ingest([event('accepted', 'essential'), event('denied', 'optional_denied')]),
    ).resolves.toEqual({
      outcomes: [
        { event_id: 'accepted', status: 'accepted' },
        { event_id: 'denied', status: 'dropped', code: 'analytics_consent_denied' },
      ],
    });
    expect(append).toHaveBeenCalledWith([expect.objectContaining({ event_id: 'accepted' })]);
    expect(recordAnalyticsStage).toHaveBeenCalledWith('received', 2);
    expect(recordAnalyticsStage).toHaveBeenCalledWith('dropped', 1);
  });

  it('derives a stable server pseudonym for authenticated ingestion', async () => {
    const append = vi.fn().mockResolvedValue({ accepted: ['accepted'], deduplicated: [] });
    const recordAnalyticsStage = vi.fn();
    const service = new AnalyticsService(
      { append } as never,
      { ANALYTICS_IDENTITY_HMAC_SECRET: '01234567890123456789012345678901' } as never,
      { recordAnalyticsStage } as never,
    );

    await service.ingest([event('accepted', 'essential')], 'user-42');
    const [storedEvent] = append.mock.calls[0] as [CanonicalProductEvent[]];
    expect(storedEvent[0]?.identity).toEqual({
      type: 'authenticated',
      pseudonymous_id: '-eI_Vkl5ilwhqwejIHG4jWB2GtgfYAR-w9pY8zJuCDY',
    });
  });
});
