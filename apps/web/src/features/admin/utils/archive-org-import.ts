import { AUDIO_EXTENSIONS } from "./fetch-remote-file";

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Extracts an archive.org item identifier from /details/, /download/, /compress/ links, or a bare identifier. */
export function parseArchiveOrgIdentifier(input: string): string | null {
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (host !== "archive.org" && !host.endsWith(".archive.org")) return null;

    const segments = url.pathname.split("/").filter(Boolean);
    const kind = segments[0];
    if ((kind === "details" || kind === "download" || kind === "compress") && segments[1]) {
      return segments[1];
    }
    return null;
  } catch {
    // Not a URL — treat as a bare identifier if it looks like one.
    return IDENTIFIER_PATTERN.test(trimmed) ? trimmed : null;
  }
}

function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

/** Lists an archive.org item's audio files via the (CORS-open) metadata API, resolved to direct download URLs. */
export async function resolveArchiveOrgFiles(
  identifier: string,
): Promise<{ url: string; filename: string }[]> {
  const response = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!response.ok) {
    throw new Error(`Couldn't load this archive.org item (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as { files?: { name: string }[] };
  const files = data.files ?? [];

  const audioFiles: { url: string; filename: string }[] = [];
  for (const file of files) {
    if (!AUDIO_EXTENSIONS.includes(extensionOf(file.name))) continue;
    audioFiles.push({
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`,
      filename: file.name,
    });
  }
  return audioFiles;
}
