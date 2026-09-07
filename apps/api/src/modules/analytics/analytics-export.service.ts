import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { Prisma } from '@sd/core-db';
import { AnalyticsExportRepository } from './analytics-export.repository';
import { AnalyticsExportStorage, type ExportObject } from './analytics-export.storage';
import { TelemetryService } from '../../core/telemetry/telemetry.service';

import {
  buildExportParameterHash,
  type AnalyticsExportCursor,
  type AnalyticsExportParameters,
} from './analytics-export.types';

/** Hourly, lease-protected analytics archive exporter. */
@Injectable()
/** Coordinates leased hourly exports and never mutates completed artifacts. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorator separates the class declaration from its TSDoc.
export class AnalyticsExportService {
  constructor(
    private readonly repository: AnalyticsExportRepository,
    private readonly storage: AnalyticsExportStorage,
    private readonly telemetry: TelemetryService,
  ) {}

  /** Runs the current completed hour; deployment startup never performs a historical backfill. */
  @Cron('0 * * * *')
  async runScheduledExport(): Promise<void> {
    const now = new Date();
    const activationWatermark = await this.repository.ensureActivation(now);
    const toReceivedAt = new Date(now);
    toReceivedAt.setUTCMinutes(0, 0, 0);
    const fromReceivedAt = new Date(toReceivedAt.getTime() - 60 * 60 * 1000);
    await this.exportRange({
      activationWatermark,
      fromReceivedAt,
      toReceivedAt,
      formatVersion: 'raw-v1',
      datasetVersion: 'exposure-v1',
    });
  }

  /** Exports one immutable range and safely resumes an abandoned run. */
  // oxlint-disable-next-line eslint(complexity) -- This is the bounded export state machine: claim, page, checkpoint, manifest, or fail.
  async exportRange(parameters: AnalyticsExportParameters): Promise<void> {
    const parameterHash = buildExportParameterHash(parameters);
    this.telemetry.recordAnalyticsExport('started');
    const run = await this.repository.ensureRun(parameters, parameterHash);
    if (!(await this.repository.claim(run.id, new Date()))) return;

    const state = resumeState(run);

    try {
      await this.exportPages(run.id, parameters, state);
      const manifest = {
        version: 'manifest-v1',
        runId: run.id,
        formatVersion: parameters.formatVersion,
        datasetVersion: parameters.datasetVersion,
        parts: state.objects,
      } satisfies Prisma.InputJsonObject;
      await this.storage.writeManifest(run.id, manifest);
      await this.repository.complete(run.id, manifest);
      this.telemetry.recordAnalyticsExport('completed');
    } catch (error) {
      await this.repository.fail(run.id, error instanceof Error ? error.message : String(error));
      this.telemetry.recordAnalyticsExport('failed');
      throw error;
    }
  }

  private async exportPages(
    runId: string,
    parameters: AnalyticsExportParameters,
    state: ExportState,
  ): Promise<void> {
    while (true) {
      const page = await this.repository.readPage(parameters, state.cursor, 5000);
      if (!page.events.length) return;
      await this.writePage(runId, state, page);
      if (!page.nextCursor || page.events.length < 5000) return;
    }
  }

  private async writePage(
    runId: string,
    state: ExportState,
    page: Awaited<ReturnType<AnalyticsExportRepository['readPage']>>,
  ): Promise<void> {
    const raw = await this.storage.writePart(runId, state.part, page, 'raw');
    if (raw) state.objects.push(raw);
    const derived = await this.storage.writePart(runId, state.part, page, 'ml');
    if (derived) state.objects.push(derived);
    if (page.nextCursor) {
      state.cursor = page.nextCursor;
      await this.repository.checkpoint(runId, state.cursor, state.part + 1);
    }
    state.part += 1;
  }
}

type ExportState = {
  cursor: AnalyticsExportCursor | undefined;
  part: number;
  objects: ExportObject[];
};

function resumeState(run: {
  cursorReceivedAt: Date | null;
  cursorEventId: string | null;
  nextPart: number;
  manifest: unknown;
}): ExportState {
  const cursor =
    run.cursorReceivedAt && run.cursorEventId
      ? { receivedAt: run.cursorReceivedAt, eventId: run.cursorEventId }
      : undefined;
  // SAFETY: persisted manifests are written by this service with a `parts` array.
  const persistedManifest = run.manifest as { parts?: unknown } | null;
  // SAFETY: Array.isArray confirms the only runtime shape consumed here.
  const objects = Array.isArray(persistedManifest?.parts)
    ? (persistedManifest.parts as ExportObject[])
    : [];
  return { cursor, part: run.nextPart, objects };
}
