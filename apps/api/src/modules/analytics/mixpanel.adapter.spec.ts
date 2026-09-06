import { describe, expect, it, vi } from 'bun:test';
import type { CanonicalProductEvent } from '@sd/core-analytics';
import { MixpanelAdapter } from './mixpanel.adapter';

const event: CanonicalProductEvent = {
  event_id: 'event-1',
  event_name: 'listing_saved',
  schema_version: 'v1',
  occurred_at: '2026-09-06T18:00:00.000Z',
  received_at: '2026-09-06T18:00:01.000Z',
  source: 'api',
  platform: 'api',
  app_version: 'test-api',
  consent_state: 'essential',
  identity: { type: 'authenticated', pseudonymous_id: 'subject-hash' },
  event_context: { source_surface: 'api' },
  content_references: { listing_slug: 'lesson-one', scholar_slug: 'scholar-one' },
  authority: 'backend_confirmed',
  producer: 'api',
  priority: 'important',
  properties: {},
};

function createAdapter(fetchImpl = vi.fn().mockResolvedValue(new Response('{"code": 0}'))) {
  const config = {
    MIXPANEL_PROJECT_TOKEN: 'project-token',
    MIXPANEL_API_URL: 'https://api.mixpanel.com',
    NODE_ENV: 'test',
    OTEL_ENVIRONMENT: undefined,
  };
  return { adapter: new MixpanelAdapter(config as any, fetchImpl as any), fetchImpl };
}

describe('MixpanelAdapter', () => {
  it('maps canonical events to the import contract and authenticates with the project token', async () => {
    const { adapter, fetchImpl } = createAdapter();

    await expect(adapter.publish([event])).resolves.toEqual({
      accepted: ['event-1'],
      rejected: [],
      disabled: false,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.mixpanel.com/import?strict=1',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from('project-token:').toString('base64')}`,
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }),
    );
    const requestOptions = fetchImpl.mock.calls[0]?.[1];
    expect(requestOptions).toBeDefined();
    const request = JSON.parse((requestOptions as RequestInit).body as string);
    expect(request).toHaveLength(1);
    expect(request[0]).toEqual({
      event: 'listing_saved',
      properties: expect.objectContaining({
        time: 1788717600,
        distinct_id: 'subject-hash',
        $insert_id: 'event-1',
        listing_slug: 'lesson-one',
        scholar_slug: 'scholar-one',
      }),
    });
    expect(JSON.stringify(request)).not.toContain('user-1');
  });

  it('does not block archive delivery when the provider token is absent', async () => {
    const fetchImpl = vi.fn();
    const { adapter } = createAdapter(fetchImpl);
    const disabled = new MixpanelAdapter(
      {
        MIXPANEL_PROJECT_TOKEN: undefined,
        MIXPANEL_API_URL: 'https://api.mixpanel.com',
        NODE_ENV: 'test',
        OTEL_ENVIRONMENT: undefined,
      } as any,
      fetchImpl as any,
    );

    await expect(disabled.publish([event])).resolves.toEqual({
      accepted: ['event-1'],
      rejected: [],
      disabled: true,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(adapter).toBeDefined();
  });

  it('classifies rate limits and provider outages as retryable', async () => {
    const { adapter } = createAdapter(
      vi.fn().mockResolvedValue(new Response('busy', { status: 429 })),
    );

    await expect(adapter.publish([event])).rejects.toMatchObject({
      retryable: true,
      status: 429,
    });
  });

  it('classifies strict import validation failures as permanent', async () => {
    const { adapter } = createAdapter(
      vi.fn().mockResolvedValue(new Response('invalid', { status: 400 })),
    );

    await expect(adapter.publish([event])).rejects.toMatchObject({
      retryable: false,
      status: 400,
      eventIds: ['event-1'],
    });
  });
});
