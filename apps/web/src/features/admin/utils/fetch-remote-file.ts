/** Mirrors the backend's audio extension allowlist (apps/api media.service.ts) for client-side use. */
const AUDIO_EXTENSION_MIME = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  opus: "audio/opus",
  wav: "audio/wav",
} satisfies Record<string, string>;

type AudioExtension = keyof typeof AUDIO_EXTENSION_MIME;

/** Lists extensions the remote-file importer treats as supported audio formats. */
export const AUDIO_EXTENSIONS = Object.keys(AUDIO_EXTENSION_MIME);

/** Extracts an RFC 5987/Content-Disposition filename, or null when the header has none. */
export function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

/** Derives a decoded filename from the URL path, falling back to `download` for invalid or empty URLs. */
export function filenameFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : "download";
  } catch {
    return "download";
  }
}

function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function isAudioExtension(value: string): value is AudioExtension {
  return value in AUDIO_EXTENSION_MIME;
}

/** Resolves a response's Content-Type, falling back to an extension-based guess when missing/generic. */
export function resolveContentType(contentType: string | null, filename: string): string {
  const isGeneric = !contentType || contentType.startsWith("application/octet-stream");
  const extension = extensionOf(filename);
  return isGeneric
    ? isAudioExtension(extension)
      ? AUDIO_EXTENSION_MIME[extension]
      : "application/octet-stream"
    : contentType;
}

function friendlyCorsError(): Error {
  return new Error(
    "This link can't be downloaded directly from the browser — the source server doesn't allow cross-origin downloads. Try a different host (e.g. archive.org), or download it manually and upload the file instead.",
  );
}

async function readBodyWithProgress(
  response: Response,
  onProgress: (loaded: number, total: number | null) => void,
): Promise<Blob> {
  const total = (() => {
    const header = response.headers.get("content-length");
    const parsed = header ? Number(header) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  })();

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total);
    }
  }

  // SAFETY: the stream reader yields Uint8Array chunks, which are valid BlobPart values.
  return new Blob(chunks as BlobPart[]);
}

/** Downloads a remote file, validates that it is not HTML, and returns it with inferred metadata. */
export async function fetchFileFromUrl(
  url: string,
  onProgress?: (loaded: number, total: number | null) => void,
): Promise<File> {
  const response = await fetchFileResponse(url);
  validateFileResponse(response);

  const filename =
    filenameFromContentDisposition(response.headers.get("content-disposition")) ??
    filenameFromUrl(url);
  const resolvedType = resolveContentType(response.headers.get("content-type") ?? "", filename);
  const blob = await readFileBlob(response, onProgress);

  return new File([blob], filename, { type: resolvedType });
}

async function fetchFileResponse(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw friendlyCorsError();
  }
}

function validateFileResponse(response: Response): void {
  if (!response.ok) {
    throw new Error(`Failed to fetch file: HTTP ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("text/html")) {
    throw new Error(
      "This link points to a web page, not a direct audio file. Find the direct download link instead.",
    );
  }
}

async function readFileBlob(
  response: Response,
  onProgress?: (loaded: number, total: number | null) => void,
): Promise<Blob> {
  return onProgress && response.body
    ? await readBodyWithProgress(response, onProgress)
    : await response.blob();
}
