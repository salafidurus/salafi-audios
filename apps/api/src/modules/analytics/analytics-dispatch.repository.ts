import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, type AnalyticsDispatchStatus } from '@sd/core-db';
import { PrimaryDbService } from '../../core/db/primary-db.service';

/** Primary-database analytics dispatch boundary for atomic intents and leased delivery claims. */

/** API type describing the primary transaction payload consumed by the backend analytics dispatcher. */
export type AnalyticsDispatchIntentInput = {
  eventId?: string;
  eventName: string;
  subjectId: string;
  payload: Prisma.InputJsonObject;
  /** Event-time timestamp preserved as the intent creation time for archive translation. */
  occurredAt?: Date;
};

/** Claimed analytics intent with the delivery-attempt metadata needed by a worker. */
export type ClaimedAnalyticsDispatchIntent = {
  eventId: string;
  eventName: string;
  subjectId: string;
  payload: Prisma.JsonObject;
  attempts: number;
  /** Primary commit time used as the event-time fallback during translation. */
  createdAt: Date;
};

@Injectable()
/** Primary-database boundary for atomic analytics intents and leased delivery claims. */
export class AnalyticsDispatchRepository {
  constructor(private readonly prisma: PrimaryDbService) {}

  /** Writes an intent through the caller's transaction so business state and delivery coordinate atomically. */
  async append(
    transaction: Prisma.TransactionClient,
    input: AnalyticsDispatchIntentInput,
  ): Promise<void> {
    const data: Prisma.AnalyticsDispatchIntentCreateInput = {
      eventId: input.eventId ?? randomUUID(),
      eventName: input.eventName,
      subjectId: input.subjectId,
      payload: input.payload,
    };
    if (input.occurredAt) data.createdAt = input.occurredAt;
    await transaction.analyticsDispatchIntent.create({ data });
  }

  /** Claims pending or abandoned work without allowing concurrent workers to claim the same row. */
  async claimDue(
    limit = 50,
    now = new Date(),
    leaseTimeoutMs = 120_000,
  ): Promise<ClaimedAnalyticsDispatchIntent[]> {
    const staleBefore = new Date(now.getTime() - leaseTimeoutMs);
    return this.prisma.$transaction((transaction) =>
      transaction.$queryRaw<ClaimedAnalyticsDispatchIntent[]>(Prisma.sql`
        WITH candidates AS (
          SELECT "event_id"
          FROM "analytics_dispatch_intents"
          WHERE (
            "status" = 'pending'::"AnalyticsDispatchStatus"
            AND "available_at" <= ${now}
          ) OR (
            "status" = 'processing'::"AnalyticsDispatchStatus"
            AND "claimed_at" < ${staleBefore}
          )
          ORDER BY "available_at", "created_at"
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "analytics_dispatch_intents" AS intent
        SET
          "status" = 'processing'::"AnalyticsDispatchStatus",
          "claimed_at" = ${now},
          "attempts" = intent."attempts" + 1,
          "updated_at" = ${now}
        FROM candidates
        WHERE intent."event_id" = candidates."event_id"
        RETURNING
          intent."event_id" AS "eventId",
          intent."event_name" AS "eventName",
          intent."subject_id" AS "subjectId",
          intent."payload" AS "payload",
          intent."attempts" AS "attempts",
          intent."created_at" AS "createdAt"
      `),
    );
  }

  /** Marks an intent delivered after the archive accepts or deduplicates its event ID. */
  async markDelivered(eventId: string, now = new Date()): Promise<void> {
    await this.prisma.analyticsDispatchIntent.update({
      where: { eventId },
      data: {
        status: 'delivered' satisfies AnalyticsDispatchStatus,
        claimedAt: null,
        lastError: null,
        updatedAt: now,
      },
    });
  }

  /** Retains a retryable failure or converts it to a terminal dead letter. */
  async markFailure(input: {
    eventId: string;
    attempts: number;
    /** Normalized failure detail retained for operational dead-letter inspection. */
    error: string;
    availableAt: Date;
    maxAttempts: number;
    now?: Date;
  }): Promise<void> {
    const now = input.now ?? new Date();
    await this.prisma.analyticsDispatchIntent.update({
      where: { eventId: input.eventId },
      data: {
        status:
          input.attempts >= input.maxAttempts
            ? ('dead_letter' satisfies AnalyticsDispatchStatus)
            : ('pending' satisfies AnalyticsDispatchStatus),
        availableAt: input.availableAt,
        claimedAt: null,
        lastError: input.error,
        updatedAt: now,
      },
    });
  }
}
