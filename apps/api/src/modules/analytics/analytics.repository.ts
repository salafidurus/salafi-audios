import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { CanonicalProductEvent } from '@sd/core-analytics';
import { AnalyticsDbService } from '../../core/db/analytics-db.service';

/** analytics application module responsible for analytics.repository behavior at the backend boundary. */
const CONFLICT_ERROR_PREFIX = 'analytics_event_id_conflict:';

@Injectable()
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsRepository {
  constructor(private readonly db: AnalyticsDbService) {}

  /** Persists a structurally valid batch atomically with retry-safe fingerprints. */
  async append(events: readonly CanonicalProductEvent[]): Promise<{
    accepted: string[];
    deduplicated: string[];
  }> {
    const receivedAt = new Date();
    const accepted: string[] = [];
    const deduplicated: string[] = [];
    await this.db.$transaction(async (transaction) => {
      const existing = await transaction.analyticsEvent.findMany({
        where: { eventId: { in: events.map((event) => event.event_id) } },
        select: { eventId: true, payloadFingerprint: true },
      });
      const existingById = new Map(
        existing.map((event) => [event.eventId, event.payloadFingerprint]),
      );
      const newEvents = events.filter((event) => {
        const fingerprint = fingerprintEvent(event);
        const existingFingerprint = existingById.get(event.event_id);
        if (existingFingerprint && existingFingerprint !== fingerprint) {
          throw new Error(`${CONFLICT_ERROR_PREFIX}${event.event_id}`);
        }
        if (existingFingerprint === undefined) {
          accepted.push(event.event_id);
          return true;
        }
        deduplicated.push(event.event_id);
        return false;
      });

      await transaction.analyticsEvent.createMany({
        data: newEvents.map((event) => ({
          eventId: event.event_id,
          payloadFingerprint: fingerprintEvent(event),
          eventName: event.event_name,
          schemaVersion: event.schema_version,
          pseudonymousIdentity:
            event.identity.type === 'authenticated'
              ? event.identity.pseudonymous_id
              : event.identity.anonymous_id,
          consentState: event.consent_state,
          priority: event.priority,
          source: event.source,
          platform: event.platform,
          appVersion: event.app_version,
          occurredAt: new Date(event.occurred_at),
          receivedAt,
          listingSlug: event.content_references.listing_slug,
          scholarSlug: event.content_references.scholar_slug,
          canonicalJson: event,
        })),
      });
    });
    return { accepted, deduplicated };
  }
}

function fingerprintEvent(event: CanonicalProductEvent): string {
  const { received_at: _receivedAt, ...clientPayload } = event;
  return createHash('sha256').update(JSON.stringify(clientPayload)).digest('hex');
}
