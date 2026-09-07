import { Injectable } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import { AnalyticsDbService } from '../../core/db/analytics-db.service';
import type { AnalyticsExportCursor, AnalyticsExportParameters } from './analytics-export.types';

/** Durable analytics export queries, leases, and checkpoints owned by PostgreSQL. */
type AnalyticsEventWhere = {
  receivedAt: { gte: Date; lt: Date };
  OR?: Array<{ receivedAt: { gt: Date } } | { receivedAt: Date; eventId: { gt: string } }>;
};

/** A bounded page of immutable archive rows ordered for resumable export. */
export type AnalyticsExportPage = {
  events: Array<{
    eventId: string;
    eventName: string;
    /** Canonical event schema version preserved in the raw archive. */
    schemaVersion: string;
    pseudonymousIdentity: string | null;
    /** Consent state observed at event ingestion. */
    consentState: string;
    priority: string;
    /** Producer source retained for downstream population analysis. */
    source: string;
    platform: string;
    /** Producer application version retained for compatibility analysis. */
    appVersion: string;
    occurredAt: Date;
    receivedAt: Date;
    /** Public listing identity, when present in the event envelope. */
    listingSlug: string | null;
    /** Public scholar identity, when present in the event envelope. */
    scholarSlug: string | null;
    canonicalJson: Prisma.JsonValue;
  }>;
  nextCursor?: AnalyticsExportCursor;
};

/** Analytics-database state boundary for leases, checkpoints, and keyset reads. */
@Injectable()
/** Analytics-database state boundary for leases, checkpoints, and keyset reads. */
export class AnalyticsExportRepository {
  constructor(private readonly db: AnalyticsDbService) {}

  /** Records the first scheduler activation exactly once for the environment. */
  async ensureActivation(now: Date): Promise<Date> {
    const activation = await this.db.analyticsExportActivation.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', activatedAt: now },
      update: {},
    });
    return activation.activatedAt;
  }

  /** Creates or reuses the run identified by its immutable parameter hash. */
  async ensureRun(parameters: AnalyticsExportParameters, parameterHash: string) {
    return this.db.analyticsExportRun.upsert({
      where: { parameterHash },
      create: {
        parameterHash,
        activationWatermark: parameters.activationWatermark,
        fromReceivedAt: parameters.fromReceivedAt,
        toReceivedAt: parameters.toReceivedAt,
        formatVersion: parameters.formatVersion,
        datasetVersion: parameters.datasetVersion,
      },
      update: {},
    });
  }

  /** Claims one run, allowing only abandoned processing leases to be reclaimed. */
  async claim(runId: string, now: Date, leaseTimeoutMs = 120_000): Promise<boolean> {
    const staleBefore = new Date(now.getTime() - leaseTimeoutMs);
    const result = await this.db.analyticsExportRun.updateMany({
      where: {
        id: runId,
        OR: [
          { status: 'pending' },
          { status: 'failed' },
          { status: 'processing', claimedAt: { lt: staleBefore } },
        ],
      },
      data: { status: 'processing', claimedAt: now, lastError: null },
    });
    return result.count === 1;
  }

  /** Reads a keyset page after the durable cursor and clamps reads to activation. */
  async readPage(
    parameters: AnalyticsExportParameters,
    cursor: AnalyticsExportCursor | undefined,
    limit: number,
  ): Promise<AnalyticsExportPage> {
    const lowerBound = new Date(
      Math.max(parameters.activationWatermark.getTime(), parameters.fromReceivedAt.getTime()),
    );
    const where: AnalyticsEventWhere = {
      receivedAt: { gte: lowerBound, lt: parameters.toReceivedAt },
    };
    if (cursor) {
      where.OR = [
        { receivedAt: { gt: cursor.receivedAt } },
        { receivedAt: cursor.receivedAt, eventId: { gt: cursor.eventId } },
      ];
    }
    const events = await this.db.analyticsEvent.findMany({
      where,
      orderBy: [{ receivedAt: 'asc' }, { eventId: 'asc' }],
      take: limit,
    });
    const last = events.at(-1);
    return {
      events,
      nextCursor: last ? { receivedAt: last.receivedAt, eventId: last.eventId } : undefined,
    };
  }

  /** Advances the checkpoint only after the caller has persisted the object successfully. */
  async checkpoint(runId: string, cursor: AnalyticsExportCursor, nextPart: number): Promise<void> {
    await this.db.analyticsExportRun.update({
      where: { id: runId },
      data: { cursorReceivedAt: cursor.receivedAt, cursorEventId: cursor.eventId, nextPart },
    });
  }

  /** Publishes the final manifest only after every part has been verified. */
  async complete(runId: string, manifest: Prisma.InputJsonValue): Promise<void> {
    await this.db.analyticsExportRun.update({
      where: { id: runId },
      data: { status: 'completed', claimedAt: null, manifest },
    });
  }

  /** Records a retryable failure while retaining the run and its checkpoint. */
  async fail(runId: string, error: string): Promise<void> {
    await this.db.analyticsExportRun.update({
      where: { id: runId },
      data: { status: 'failed', claimedAt: null, lastError: error.slice(0, 1000) },
    });
  }
}
