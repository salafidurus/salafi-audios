import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { CanonicalProductEvent } from '@sd/core-analytics';
import { createHmac } from 'node:crypto';
import { AnalyticsRepository } from './analytics.repository';
import { ConfigService } from '../../core/config/config.service';

/** NestJS analytics service coordinating the API boundary for this responsibility. */
@Injectable()
/** analytics application module responsible for analytics.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly config: ConfigService,
  ) {}

  /** Stores accepted events and maps persistence failures to stable API errors. */
  async ingest(
    events: readonly CanonicalProductEvent[],
    authenticatedUserId?: string,
  ): Promise<{
    outcomes: Array<{
      event_id: string;
      /** Outcome for this event after consent filtering and append-only persistence. */
      status: 'accepted' | 'deduplicated' | 'dropped';
      code?: string;
    }>;
  }> {
    const normalized = events.map((event) =>
      normalizeIdentity(event, authenticatedUserId, this.config),
    );
    const accepted = events.filter(
      (event) => event.consent_state === 'essential' || event.consent_state === 'optional_granted',
    );
    if (!accepted.length) {
      return {
        outcomes: events.map((event) => ({
          event_id: event.event_id,
          status: 'dropped',
          code: 'analytics_consent_denied',
        })),
      };
    }

    try {
      const result = await this.repository.append(
        normalized.filter(
          (event) =>
            event.consent_state === 'essential' || event.consent_state === 'optional_granted',
        ),
      );
      const acceptedIds = new Set(result.accepted);
      const deduplicatedIds = new Set(result.deduplicated);
      return {
        outcomes: events.map((event) =>
          event.consent_state !== 'essential' && event.consent_state !== 'optional_granted'
            ? { event_id: event.event_id, status: 'dropped', code: 'analytics_consent_denied' }
            : acceptedIds.has(event.event_id)
              ? { event_id: event.event_id, status: 'accepted' }
              : deduplicatedIds.has(event.event_id)
                ? { event_id: event.event_id, status: 'deduplicated' }
                : { event_id: event.event_id, status: 'accepted' },
        ),
      };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('analytics_event_id_conflict:')) {
        throw new ConflictException({ code: 'analytics_event_id_conflict' });
      }
      throw new ServiceUnavailableException({ code: 'analytics_store_unavailable' });
    }
  }
}

function normalizeIdentity(
  event: CanonicalProductEvent,
  authenticatedUserId: string | undefined,
  config: ConfigService,
): CanonicalProductEvent {
  if (!authenticatedUserId) {
    if (event.identity.type !== 'anonymous') {
      throw new UnauthorizedException({ code: 'analytics_invalid_session' });
    }
    return event;
  }
  if (event.identity.type !== 'anonymous') {
    throw new BadRequestException({ code: 'analytics_invalid_event' });
  }
  return {
    ...event,
    identity: {
      type: 'authenticated',
      pseudonymous_id: createHmac('sha256', config.ANALYTICS_IDENTITY_HMAC_SECRET)
        .update(`user:${authenticatedUserId}`)
        .digest('base64url'),
    },
  };
}
