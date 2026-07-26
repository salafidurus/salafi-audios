/** Mirrors the backend's audio extension allowlist (apps/api media.service.ts) for client-side use. */
const AUDIO_EXTENSION_MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  opus: "audio/opus",
  wav: "audio/wav",
};

export const AUDIO_EXTENSIONS = Object.keys(AUDIO_EXTENSION_MIME);

export function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

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

/** Resolves a response's Content-Type, falling back to an extension-based guess when missing/generic. */
export function resolveContentType(contentType: string | null, filename: string): string {
  const isGeneric = !contentType || contentType.startsWith("application/octet-stream");
  return isGeneric
    ? (AUDIO_EXTENSION_MIME[extensionOf(filename)] ?? "application/octet-stream")
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

  return new Blob(chunks as BlobPart[]);
}

export async function fetchFileFromUrl(
  url: string,
  onProgress?: (loaded: number, total: number | null) => void,
): Promise<File> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw friendlyCorsError();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch file: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("text/html")) {
    throw new Error(
      "This link points to a web page, not a direct audio file. Find the direct download link instead.",
    );
  }

  const filename =
    filenameFromContentDisposition(response.headers.get("content-disposition")) ??
    filenameFromUrl(url);
  const resolvedType = resolveContentType(contentType, filename);

  const blob =
    onProgress && response.body
      ? await readBodyWithProgress(response, onProgress)
      : await response.blob();

  return new File([blob], filename, { type: resolvedType });
}
