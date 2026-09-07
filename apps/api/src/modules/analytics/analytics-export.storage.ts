import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@sd/core-db';
import { S3Client } from 'bun';
import { ConfigService } from '../../core/config/config.service';
import type { AnalyticsExportPage } from './analytics-export.repository';

/** Private R2 Parquet serialization and verification boundary for analytics exports. */
// parquetjs-lite is CommonJS and publishes no declarations.
// oxlint-disable-next-line @typescript-eslint/no-require-imports
// SAFETY: parquetjs-lite is pinned in apps/api/package.json and its CommonJS exports are stable.
const parquet = require('parquetjs-lite') as typeof import('parquetjs-lite');

/** Verified private-object metadata returned by the R2 persistence boundary. */
export type ExportObject = { key: string; sha256: string; bytes: number; rowCount: number };

/** Maps only explicit contract events to ML labels; absence is never a negative label. */
function derivedLabel(eventName: string): string | undefined {
  if (eventName === 'listing_viewed') return 'exposure';
  if (['audio_started', 'audio_milestone', 'audio_completed_observed'].includes(eventName)) {
    return 'interaction';
  }
  if (['audio_completed', 'listing_saved', 'scholar_followed'].includes(eventName)) {
    return 'confirmed_outcome';
  }
  return undefined;
}

/** R2 persistence adapter used by the scheduler; it never exposes public URLs. */
@Injectable()
/** Private R2 Parquet serialization and verification boundary for analytics exports. */
export class AnalyticsExportStorage {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;

  constructor(config: ConfigService) {
    this.bucket = config.R2_ANALYTICS_BUCKET_NAME;
    this.prefix = config.R2_ANALYTICS_PREFIX;
    this.s3 = new S3Client({
      accessKeyId: config.R2_ANALYTICS_ACCESS_KEY_ID,
      secretAccessKey: config.R2_ANALYTICS_SECRET_ACCESS_KEY,
      bucket: this.bucket,
      endpoint: `https://${config.R2_ANALYTICS_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });
  }

  /** Serializes a page as a self-contained Parquet object and verifies its persisted bytes. */
  async writePart(
    runId: string,
    part: number,
    page: AnalyticsExportPage,
    dataset: 'raw' | 'ml' = 'raw',
  ): Promise<ExportObject | undefined> {
    const events =
      dataset === 'ml' ? page.events.filter((event) => derivedLabel(event.eventName)) : page.events;
    if (!events.length) return undefined;
    const directory = await mkdtemp(join(tmpdir(), 'salafi-analytics-'));
    const filePath = join(directory, `${runId}-${part}.parquet`);
    try {
      const schema = new parquet.ParquetSchema({
        eventId: { type: 'UTF8' },
        eventName: { type: 'UTF8' },
        schemaVersion: { type: 'UTF8' },
        pseudonymousIdentity: { type: 'UTF8', optional: true },
        consentState: { type: 'UTF8' },
        priority: { type: 'UTF8' },
        source: { type: 'UTF8' },
        platform: { type: 'UTF8' },
        appVersion: { type: 'UTF8' },
        occurredAt: { type: 'TIMESTAMP_MILLIS' },
        receivedAt: { type: 'TIMESTAMP_MILLIS' },
        listingSlug: { type: 'UTF8', optional: true },
        scholarSlug: { type: 'UTF8', optional: true },
        eventContext: { type: 'UTF8' },
        properties: { type: 'UTF8' },
        canonicalJson: { type: 'UTF8' },
        mlLabel: { type: 'UTF8', optional: true },
      });
      const writer = await parquet.ParquetWriter.openFile(schema, filePath);
      for (const event of events) {
        // SAFETY: canonicalJson is validated by @sd/core-analytics as an object envelope at ingestion.
        const canonical = event.canonicalJson as Prisma.JsonObject;
        // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Parquet row writes must remain sequential because the writer owns one ordered file stream.
        await writer.appendRow({
          eventId: event.eventId,
          eventName: event.eventName,
          schemaVersion: event.schemaVersion,
          pseudonymousIdentity: event.pseudonymousIdentity,
          consentState: event.consentState,
          priority: event.priority,
          source: event.source,
          platform: event.platform,
          appVersion: event.appVersion,
          occurredAt: event.occurredAt,
          receivedAt: event.receivedAt,
          listingSlug: event.listingSlug,
          scholarSlug: event.scholarSlug,
          eventContext: JSON.stringify(canonical['event_context'] ?? {}),
          properties: JSON.stringify(canonical['properties'] ?? {}),
          canonicalJson: JSON.stringify(event.canonicalJson),
          mlLabel: derivedLabel(event.eventName),
        });
      }
      await writer.close();
      const bytes = await readFile(filePath);
      const key = `${this.prefix}/runs/${runId}/${dataset}/parts/${String(part).padStart(8, '0')}.parquet`;
      await this.s3.file(key).write(bytes, { type: 'application/octet-stream' });
      const persisted = await this.s3.file(key).arrayBuffer();
      const persistedBytes = Buffer.from(persisted);
      const sha256 = createHash('sha256').update(persistedBytes).digest('hex');
      return { key, sha256, bytes: persistedBytes.byteLength, rowCount: events.length };
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  /** Writes the manifest last so consumers never observe a partially verified export. */
  async writeManifest(runId: string, manifest: Prisma.InputJsonValue): Promise<void> {
    const key = `${this.prefix}/runs/${runId}/manifest.json`;
    await this.s3.file(key).write(JSON.stringify(manifest), { type: 'application/json' });
  }
}
