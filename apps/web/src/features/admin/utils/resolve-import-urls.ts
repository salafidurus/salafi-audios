import { parseArchiveOrgIdentifier, resolveArchiveOrgFiles } from "./archive-org-import";
import { extractAudioDurationFromUrl } from "./audio-metadata";
import { fetchFileFromUrl } from "./fetch-remote-file";
import { fetchUrlMetadata } from "./fetch-url-metadata";
import { parseGoogleDriveLink, buildGoogleDriveDownloadUrl } from "./google-drive-import";
import { isKnownUnsupportedSource } from "./unsupported-sources";

/** Describes a user-facing error associated with one import input. */
export interface ImportUrlError {
  input: string;
  message: string;
}

/** Documents the intent and contract of this declaration. */
export interface ImportFilesResult {
  files: File[];
  /** Documents the intent and contract of this field. */ errors: ImportUrlError[];
}

/** Documents the intent and contract of this declaration. */
export interface ImportMetadataItem {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  /** Documents the intent and contract of this field. */ durationSeconds: number | null;
}

/** Documents the intent and contract of this declaration. */
export interface ImportMetadataResult {
  items: ImportMetadataItem[];
  /** Documents the intent and contract of this field. */ errors: ImportUrlError[];
}

interface ResolvedEntry {
  url: string;
}

function getErrorMessage(error: Error | null | undefined, fallback: string): string {
  return error?.message ?? fallback;
}

/** Resolves one pasted line into zero or more fetchable URLs, or an immediate per-line error. */
async function resolveLine(
  line: string,
): Promise<
  | { entries: ResolvedEntry[] }
  | { /** Documents the intent and contract of this field. */ error: string }
> {
  const unsupported = isKnownUnsupportedSource(line);
  if (unsupported) return { error: unsupported };

  const archiveOrgId = parseArchiveOrgIdentifier(line);
  if (archiveOrgId) {
    try {
      const files = await resolveArchiveOrgFiles(archiveOrgId);
      return { entries: files.map((f) => ({ url: f.url })) };
    } catch (err) {
      return {
        error: getErrorMessage(
          err instanceof Error ? err : null,
          "Failed to load this archive.org item.",
        ),
      };
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
async function resolveLinesToQueue(lines: string[]): Promise<{
  queue: ResolvedEntry[];
  /** Documents the intent and contract of this field. */ errors: ImportUrlError[];
}> {
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

/** Documents the intent and contract of this declaration. */
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
          message: getErrorMessage(
            err instanceof Error ? err : null,
            "Failed to download this file.",
          ),
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { files, errors };
}

/** Resolves and fetches a single pasted line, forwarding download progress — for callers
 *  (like the single AudioUploader) that expect exactly one resulting file. */
export async function importSingleLineWithProgress(
  line: string,
  onProgress?: (loaded: number, total: number | null) => void,
): Promise<ImportFilesResult> {
  const { queue, errors } = await resolveLinesToQueue([line]);
  const singleProgress = queue.length === 1 ? onProgress : undefined;

  const results = await Promise.all(
    queue.map(
      async (
        entry,
      ): Promise<
        | { file: File }
        | { /** Documents the intent and contract of this field. */ error: ImportUrlError }
      > => {
        try {
          return { file: await fetchFileFromUrl(entry.url, singleProgress) };
        } catch (err) {
          return {
            error: {
              input: entry.url,
              message: getErrorMessage(
                err instanceof Error ? err : null,
                "Failed to download this file.",
              ),
            },
          };
        }
      },
    ),
  );

  const files: File[] = [];
  for (const result of results) {
    if ("file" in result) files.push(result.file);
    else errors.push(result.error);
  }

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
          message: getErrorMessage(
            err instanceof Error ? err : null,
            "Failed to read this link's metadata.",
          ),
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  return { items, errors };
}
