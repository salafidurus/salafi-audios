import {
  filenameFromContentDisposition,
  filenameFromUrl,
  resolveContentType,
} from "./fetch-remote-file";

export interface UrlMetadata {
  filename: string;
  contentType: string;
  sizeBytes: number | null;
}

function friendlyCorsError(): Error {
  return new Error(
    "This link can't be reached directly from the browser — the source server doesn't allow cross-origin requests. Try a different host (e.g. archive.org), or download it manually and upload the file instead.",
  );
}

function parseContentLength(headers: Headers): number | null {
  const header = headers.get("content-length");
  if (!header) return null;
  const parsed = Number(header);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseContentRangeTotal(headers: Headers): number | null {
  const header = headers.get("content-range");
  const match = header?.match(/\/(\d+)$/);
  return match?.[1] ? Number(match[1]) : null;
}

/** Reads filename/content-type/size without downloading the file body — HEAD first, falling back to a 1-byte ranged GET for hosts that reject HEAD. */
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const response = await fetchMetadataResponse(url);
  validateMetadataResponse(response);

  return buildUrlMetadata(url, response);
}

async function fetchMetadataResponse(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { method: "HEAD" });
  } catch {
    throw friendlyCorsError();
  }

  if (response.ok) return response;

  try {
    response = await fetch(url, { headers: { Range: "bytes=0-0" } });
  } catch {
    throw friendlyCorsError();
  }
  if (!response.ok) {
    throw new Error(`Couldn't read this link's metadata (HTTP ${response.status}).`);
  }
  return response;
}

function validateMetadataResponse(response: Response): void {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("text/html")) {
    throw new Error(
      "This link points to a web page, not a direct audio file. Find the direct download link instead.",
    );
  }
}

function buildUrlMetadata(url: string, response: Response): UrlMetadata {
  const contentType = response.headers.get("content-type") ?? "";
  const filename =
    filenameFromContentDisposition(response.headers.get("content-disposition")) ??
    filenameFromUrl(url);

  return {
    filename,
    contentType: resolveContentType(contentType, filename),
    sizeBytes: parseContentLength(response.headers) ?? parseContentRangeTotal(response.headers),
  };
}
