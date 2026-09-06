import { Injectable, Optional } from '@nestjs/common';
import type { CanonicalProductEvent } from '@sd/core-analytics';
import { ConfigService } from '../../core/config/config.service';

/** API analytics adapter module owning Mixpanel transport and provider isolation. */
/**
 * Reports which canonical event IDs were accepted by the provider boundary.
 * A disabled result treats every event as accepted by the no-op external sink
 * so the owned archive and durable dispatcher can continue independently.
 */
export type MixpanelPublishResult = {
  /** Canonical event IDs accepted by Mixpanel or the disabled no-op sink. */
  accepted: string[];
  /** Canonical event IDs rejected by a provider response, when available. */
  rejected: string[];
  /** Whether external publication was intentionally skipped due to missing configuration. */
  disabled: boolean;
};

/** Safe provider failure classification used by the durable dispatcher. */
export class MixpanelProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status: number | undefined,
    readonly eventIds: string[],
  ) {
    super(message);
    this.name = 'MixpanelProviderError';
  }
}

type MixpanelImportEvent = {
  event: string;
  properties: MixpanelProperties;
};

type MixpanelProperties = Record<string, string | number | boolean>;

/**
 * Owns all Mixpanel-specific translation, authentication, and HTTP behavior.
 * The adapter never receives internal user IDs and never exposes provider
 * credentials or response bodies in thrown errors.
 */
@Injectable()
/** Mixpanel provider sink preserving canonical event IDs across bounded retries. */
export class MixpanelAdapter {
  constructor(
    private readonly config: ConfigService,
    @Optional() private readonly fetchImpl?: typeof fetch,
  ) {}

  /** Publishes at most the caller-provided bounded batch and preserves event IDs for retries. */
  async publish(events: CanonicalProductEvent[]): Promise<MixpanelPublishResult> {
    const eventIds = events.map((event) => event.event_id);
    if (!this.config.MIXPANEL_PROJECT_TOKEN) {
      return { accepted: eventIds, rejected: [], disabled: true };
    }

    const response = await this.request(events);
    if (response.ok) {
      return { accepted: eventIds, rejected: [], disabled: false };
    }

    throw new MixpanelProviderError(
      `mixpanel_import_failed:${response.status}`,
      isRetryableStatus(response.status),
      response.status,
      eventIds,
    );
  }

  private async request(events: CanonicalProductEvent[]): Promise<Response> {
    const endpoint = new URL('/import?strict=1', this.config.MIXPANEL_API_URL).toString();
    try {
      return await (this.fetchImpl ?? fetch)(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.MIXPANEL_PROJECT_TOKEN ?? ''}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          events.map((event) =>
            toMixpanelEvent(event, this.config.OTEL_ENVIRONMENT ?? this.config.NODE_ENV),
          ),
        ),
      });
    } catch (error) {
      throw new MixpanelProviderError(
        `mixpanel_import_transport_failed:${error instanceof Error ? error.name : 'unknown'}`,
        true,
        undefined,
        events.map((event) => event.event_id),
      );
    }
  }
}

function toMixpanelEvent(event: CanonicalProductEvent, environment: string): MixpanelImportEvent {
  const content = event.content_references ?? {};
  const context = event.event_context ?? {};
  const properties = {
    distinct_id:
      event.identity.type === 'authenticated'
        ? event.identity.pseudonymous_id
        : event.identity.anonymous_id,
    time: Math.floor(new Date(event.occurred_at).getTime() / 1_000),
    $insert_id: event.event_id,
    schema_version: event.schema_version,
    source: event.source,
    platform: event.platform,
    consent_state: event.consent_state,
    authority: event.authority,
    producer: event.producer,
    environment,
  };
  addOptional(properties, 'app_version', event.app_version);
  addOptional(properties, 'interface_language', context.interface_language);
  addOptional(properties, 'preferred_language', context.preferred_language);
  addOptional(properties, 'content_language', context.content_language);
  addOptional(properties, 'audio_language', context.audio_language);
  addOptional(properties, 'country_code', context.country_code);
  addOptional(properties, 'listing_slug', content.listing_slug);
  addOptional(properties, 'scholar_slug', content.scholar_slug);
  addOptional(properties, 'source_surface', context.source_surface);
  Object.assign(properties, event.properties);
  return { event: event.event_name, properties };
}

function addOptional(properties: MixpanelProperties, key: string, value: string | undefined): void {
  if (value !== undefined) properties[key] = value;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}
