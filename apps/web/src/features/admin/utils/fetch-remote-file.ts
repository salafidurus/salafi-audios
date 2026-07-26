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

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

function filenameFromUrl(url: string): string {
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

export async function fetchFileFromUrl(url: string): Promise<File> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "This link can't be downloaded directly from the browser — the source server doesn't allow cross-origin downloads. Try a different host (e.g. archive.org), or download it manually and upload the file instead.",
    );
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

  const isGenericType = !contentType || contentType.startsWith("application/octet-stream");
  const resolvedType = isGenericType
    ? (AUDIO_EXTENSION_MIME[extensionOf(filename)] ?? "application/octet-stream")
    : contentType;

  const blob = await response.blob();
  return new File([blob], filename, { type: resolvedType });
}
