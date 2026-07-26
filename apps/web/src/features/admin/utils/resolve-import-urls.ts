import { fetchFileFromUrl } from "./fetch-remote-file";
import { fetchUrlMetadata } from "./fetch-url-metadata";
import { extractAudioDurationFromUrl } from "./audio-metadata";
import { parseArchiveOrgIdentifier, resolveArchiveOrgFiles } from "./archive-org-import";
import { parseGoogleDriveLink, buildGoogleDriveDownloadUrl } from "./google-drive-import";
import { isKnownUnsupportedSource } from "./unsupported-sources";

export interface ImportUrlError {
  input: string;
  message: string;
}

export interface ImportFilesResult {
  files: File[];
  errors: ImportUrlError[];
}

export interface ImportMetadataItem {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds: number | null;
}

export interface ImportMetadataResult {
  items: ImportMetadataItem[];
  errors: ImportUrlError[];
}

interface ResolvedEntry {
  url: string;
}

/** Resolves one pasted line into zero or more fetchable URLs, or an immediate per-line error. */
async function resolveLine(
  line: string,
): Promise<{ entries: ResolvedEntry[] } | { error: string }> {
  const unsupported = isKnownUnsupportedSource(line);
  if (unsupported) return { error: unsupported };

  const archiveOrgId = parseArchiveOrgIdentifier(line);
  if (archiveOrgId) {
    try {
      const files = await resolveArchiveOrgFiles(archiveOrgId);
      return { entries: files.map((f) => ({ url: f.url })) };
    } catch (err) {
      return { error: (err as Error)?.message ?? "Failed to load this archive.org item." };
    }
  }

  const driveLink = parseGoogleDriveLink(line);
  if (driveLink) {
    if (driveLink.kind === "unsupported-folder") {
      return {
        error:
          "Google Drive folders aren't supported — share the individual file link instead ('Anyone with the link' access).",
      };
    }
    return { entries: [{ url: buildGoogleDriveDownloadUrl(driveLink.fileId) }] };
  }

  return { entries: [{ url: line }] };
}

/** Independent per-line resolution (parsing + the occasional metadata-API call) — run
 *  concurrently rather than one-at-a-time, unlike the bounded-concurrency work that follows. */
async function resolveLinesToQueue(
  lines: string[],
): Promise<{ queue: ResolvedEntry[]; errors: ImportUrlError[] }> {
  const trimmedLines: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line) trimmedLines.push(line);
  }

  const resolutions = await Promise.all(
    trimmedLines.map((line) => resolveLine(line).then((resolved) => ({ line, resolved }))),
  );

  const queue: ResolvedEntry[] = [];
  const errors: ImportUrlError[] = [];
  for (const { line, resolved } of resolutions) {
    if ("error" in resolved) {
      errors.push({ input: line, message: resolved.error });
    } else {
      queue.push(...resolved.entries);
    }
  }
  return { queue, errors };
}

const DEFAULT_CONCURRENCY = 2;

export async function importFilesFromLines(
  lines: string[],
  concurrency = DEFAULT_CONCURRENCY,
): Promise<ImportFilesResult> {
  const { queue, errors } = await resolveLinesToQueue(lines);
  const files: File[] = [];

  const worker = async (): Promise<void> => {
    for (let entry = queue.shift(); entry; entry = queue.shift()) {
      try {
        const file = await fetchFileFromUrl(entry.url);
        files.push(file);
      } catch (err) {
        errors.push({
          input: entry.url,
          message: (err as Error)?.message ?? "Failed to download this file.",
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { files, errors };
}

/** Same link resolution as importFilesFromLines, but reads metadata only (HEAD/ranged GET +
 *  duration via an <audio> element) — no file body is downloaded. */
export async function resolveLinksToMetadata(
  lines: string[],
  concurrency = DEFAULT_CONCURRENCY,
): Promise<ImportMetadataResult> {
  const { queue, errors } = await resolveLinesToQueue(lines);
  const items: ImportMetadataItem[] = [];

  const worker = async (): Promise<void> => {
    for (let entry = queue.shift(); entry; entry = queue.shift()) {
      try {
        const meta = await fetchUrlMetadata(entry.url);
        const durationSeconds = await extractAudioDurationFromUrl(entry.url).catch(() => null);
        items.push({
          url: entry.url,
          filename: meta.filename,
          contentType: meta.contentType,
          sizeBytes: meta.sizeBytes ?? 0,
          durationSeconds,
        });
      } catch (err) {
        errors.push({
          input: entry.url,
          message: (err as Error)?.message ?? "Failed to read this link's metadata.",
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { items, errors };
}
