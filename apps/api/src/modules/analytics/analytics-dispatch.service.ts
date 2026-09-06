import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { parseProductEvent, type CanonicalProductEvent } from '@sd/core-analytics';
import type { Prisma } from '@sd/core-db';
import { AnalyticsRepository } from './analytics.repository';
import {
  AnalyticsDispatchRepository,
  type ClaimedAnalyticsDispatchIntent,
} from './analytics-dispatch.repository';
import { ConfigService } from '../../core/config/config.service';
import { PrimaryDbService } from '../../core/db/primary-db.service';
import { z } from 'zod';
import { MixpanelAdapter, MixpanelProviderError } from './mixpanel.adapter';
import { TelemetryService } from '../../core/telemetry/telemetry.service';

/** Analytics dispatch module coordinating durable intent claims, retries, and canonical archive delivery. */
const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_MS = 60_000;
const DispatchPayloadSchema = z.object({ listing_id: z.string().min(1).optional() });

@Injectable()
/** Owns leased analytics intent delivery without making business requests depend on archive availability. */
export class AnalyticsDispatchService {
  constructor(
    private readonly intents: AnalyticsDispatchRepository,
    private readonly archive: AnalyticsRepository,
    private readonly prisma: PrimaryDbService,
    private readonly config: ConfigService,
    private readonly mixpanel: MixpanelAdapter,
    private readonly telemetry: TelemetryService,
  ) {}

  /** Delivers one bounded batch and leaves failures isolated to their own intents. */
  // oxlint-disable-next-line complexity -- the worker owns the bounded delivery state machine.
  async dispatchDue(): Promise<{ delivered: number; retried: number; deadLettered: number }> {
    const claimed = await this.intents.claimDue();
    let delivered = 0;
    let retried = 0;
    let deadLettered = 0;
    const ready: Array<{
      intent: ClaimedAnalyticsDispatchIntent;
      event: CanonicalProductEvent;
      startedAt: number;
    }> = [];

    for (const intent of claimed) {
      const startedAt = Date.now();
      try {
        // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Each intent is isolated so one archive failure cannot affect another delivery state transition.
        const event = await this.translate(intent);
        await this.archive.append([event]);
        ready.push({ intent, event, startedAt });
      } catch (error) {
        if (await this.fail(intent, toError(error), startedAt)) deadLettered += 1;
        else retried += 1;
      }
    }

    if (ready.length) {
      try {
        const providerResult = await this.mixpanel.publish(ready.map(({ event }) => event));
        for (const item of ready) {
          // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Delivery state transitions stay sequential so each intent failure is isolated.
          await this.intents.markDelivered(item.intent.eventId);
          this.telemetry.recordAnalyticsDelivery(
            providerResult.disabled ? 'disabled' : 'delivered',
            Date.now() - item.startedAt,
          );
          delivered += 1;
        }
      } catch (error) {
        for (const item of ready) {
          // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Failure transitions stay sequential so one intent cannot affect another lease.
          if (await this.fail(item.intent, toError(error), item.startedAt)) deadLettered += 1;
          else retried += 1;
        }
      }
    }

    return { delivered, retried, deadLettered };
  }

  /** Scheduled worker entry point; the business request never awaits this job. */
  @Cron('*/15 * * * * *')
  async dispatchScheduled(): Promise<void> {
    await this.dispatchDue();
  }

  // oxlint-disable-next-line complexity -- event translation centralizes the closed canonical event union.
  private async translate(intent: ClaimedAnalyticsDispatchIntent): Promise<CanonicalProductEvent> {
    const payload = parseDispatchPayload(intent.payload);
    const listingId = payload.listing_id;
    const listing = listingId
      ? await this.prisma.listing.findUnique({
          where: { id: listingId },
          select: { slug: true, scholar: { select: { slug: true } } },
        })
      : null;

    if (intent.eventName !== 'user_registered' && !listing) {
      throw new Error(`analytics_dispatch_listing_missing:${listingId ?? 'unknown'}`);
    }

    const common = {
      event_id: intent.eventId,
      schema_version: 'v1',
      occurred_at: intent.createdAt.toISOString(),
      received_at: new Date().toISOString(),
      source: 'api' as const,
      platform: 'api' as const,
      app_version: this.config.OTEL_DEPLOYMENT_VERSION,
      consent_state: 'essential' as const,
      identity: {
        type: 'authenticated' as const,
        pseudonymous_id: this.pseudonym(intent.subjectId),
      },
      event_context: { source_surface: 'api' },
      authority: 'backend_confirmed' as const,
      producer: 'api' as const,
    };

    if (intent.eventName === 'user_registered') {
      return parseProductEvent({
        ...common,
        event_name: 'user_registered',
        content_references: {},
        priority: 'critical',
        properties: {},
      });
    }

    if (!listing) {
      throw new Error(`analytics_dispatch_listing_missing:${listingId ?? 'unknown'}`);
    }

    const contentReferences = {
      listing_slug: listing.slug,
      scholar_slug: listing.scholar.slug,
    };

    switch (intent.eventName) {
      case 'audio_completed':
        return parseProductEvent({
          ...common,
          event_name: 'audio_completed',
          content_references: contentReferences,
          priority: 'critical',
          properties: { completion_source: 'progress_persisted' },
        });
      case 'listing_saved':
        return parseProductEvent({
          ...common,
          event_name: 'listing_saved',
          content_references: contentReferences,
          priority: 'important',
          properties: {},
        });
      case 'listing_unsaved':
        return parseProductEvent({
          ...common,
          event_name: 'listing_unsaved',
          content_references: contentReferences,
          priority: 'important',
          properties: {},
        });
      default:
        throw new Error(`analytics_dispatch_event_unsupported:${intent.eventName}`);
    }
  }

  private pseudonym(userId: string): string {
    return createHmac('sha256', this.config.ANALYTICS_IDENTITY_HMAC_SECRET)
      .update(`user:${userId}`)
      .digest('base64url');
  }

  private async fail(
    intent: ClaimedAnalyticsDispatchIntent,
    error: Error,
    startedAt: number,
  ): Promise<boolean> {
    const permanent = isPermanentDispatchFailure(error);
    const deadLetter = shouldDeadLetter(permanent, intent.attempts);
    this.telemetry.recordAnalyticsDelivery(
      deadLetter ? (permanent ? 'rejected' : 'dead_letter') : 'retry',
      Date.now() - startedAt,
    );
    await this.intents.markFailure({
      eventId: intent.eventId,
      attempts: deadLetter ? MAX_ATTEMPTS : intent.attempts,
      error: error.message,
      availableAt: new Date(Date.now() + (deadLetter ? 0 : backoffMs(intent.attempts))),
      maxAttempts: MAX_ATTEMPTS,
    });
    return deadLetter;
  }
}

function backoffMs(attempts: number): number {
  return Math.min(2 ** Math.max(attempts - 1, 0) * 1_000, MAX_BACKOFF_MS);
}

function isArchiveConflict(error: Error): boolean {
  return error.message.startsWith('analytics_event_id_conflict:');
}

function isTranslationFailure(error: Error): boolean {
  return error.message.startsWith('analytics_dispatch_');
}

function isPermanentProviderFailure(error: Error): boolean {
  return error instanceof MixpanelProviderError && !error.retryable;
}

function isPermanentDispatchFailure(error: Error): boolean {
  return (
    isArchiveConflict(error) || isTranslationFailure(error) || isPermanentProviderFailure(error)
  );
}

function shouldDeadLetter(permanent: boolean, attempts: number): boolean {
  return permanent || attempts >= MAX_ATTEMPTS;
}

function parseDispatchPayload(payload: Prisma.JsonObject): z.infer<typeof DispatchPayloadSchema> {
  const result = DispatchPayloadSchema.safeParse(payload);
  if (!result.success) throw new Error('analytics_dispatch_payload_invalid');
  return result.data;
}

// oxlint-disable-next-line anti-slop/no-unknown-parameters -- catch clauses receive unknown values and normalize them here.
function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
