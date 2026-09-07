import { createHash } from 'node:crypto';

/** Immutable parameter and keyset contracts shared by the scheduled archive exporter. */
/** Immutable inputs that identify one analytics export run. */
export type AnalyticsExportParameters = {
  activationWatermark: Date;
  fromReceivedAt: Date;
  toReceivedAt: Date;
  /** Raw Parquet schema version; changing it creates a new run. */
  formatVersion: string;
  /** Derived projection version; changing it never rewrites raw parts. */
  datasetVersion: string;
};

/** Durable keyset position used to resume an export without offset scans. */
export type AnalyticsExportCursor = {
  receivedAt: Date;
  eventId: string;
};

/** Creates a stable digest for the immutable export inputs. */
export function buildExportParameterHash(parameters: AnalyticsExportParameters): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        activationWatermark: parameters.activationWatermark.toISOString(),
        fromReceivedAt: parameters.fromReceivedAt.toISOString(),
        toReceivedAt: parameters.toReceivedAt.toISOString(),
        formatVersion: parameters.formatVersion,
        datasetVersion: parameters.datasetVersion,
      }),
    )
    .digest('hex');
}

/** Compares cursors in the same order as the archive reader's keyset query. */
export function compareExportCursor(
  left: AnalyticsExportCursor,
  right: AnalyticsExportCursor,
): number {
  const receivedAt = left.receivedAt.getTime() - right.receivedAt.getTime();
  return receivedAt || left.eventId.localeCompare(right.eventId);
}

/** Prevents a changed watermark, range, or transformation from mutating a run. */
export function isResumableExportRun(
  run: Pick<{ parameterHash: string }, 'parameterHash'>,
  parameters: AnalyticsExportParameters,
): boolean {
  return run.parameterHash === buildExportParameterHash(parameters);
}
