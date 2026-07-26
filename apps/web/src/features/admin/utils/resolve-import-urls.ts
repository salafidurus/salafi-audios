import { fetchFileFromUrl } from "./fetch-remote-file";
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

const DEFAULT_CONCURRENCY = 2;

export async function importFilesFromLines(
  lines: string[],
  concurrency = DEFAULT_CONCURRENCY,
): Promise<ImportFilesResult> {
  const files: File[] = [];
  const errors: ImportUrlError[] = [];

  // Independent per-line resolution (parsing + the occasional metadata-API call) — run
  // concurrently rather than one-at-a-time, unlike the actual file downloads below.
  const trimmedLines: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line) trimmedLines.push(line);
  }
  const resolutions = await Promise.all(
    trimmedLines.map((line) => resolveLine(line).then((resolved) => ({ line, resolved }))),
  );

  const queue: { url: string }[] = [];
  for (const { line, resolved } of resolutions) {
    if ("error" in resolved) {
      errors.push({ input: line, message: resolved.error });
    } else {
      queue.push(...resolved.entries);
    }
  }

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
