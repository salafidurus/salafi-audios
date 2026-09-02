/** Parses Google Drive links and builds anonymous download URLs for supported files. */

/** Identifies a supported Drive file link or a recognized unsupported folder link. */
export type GoogleDriveLink =
  | {
      /** Distinguishes a downloadable Drive file from an unsupported folder. */
      kind: "file";
      /** Opaque Drive identifier used to construct the download endpoint. */
      fileId: string;
    }
  | {
      /** Distinguishes a recognized folder URL that cannot be imported as a file. */
      kind: "unsupported-folder";
    };

/**
 * Recognizes Google Drive file/folder links. Folders are flagged distinctly (rather than
 * returning null) so callers can show a specific "not supported" message instead of
 * attempting a fetch that's guaranteed to hit an anonymous-access login redirect.
 */
export function parseGoogleDriveLink(input: string): GoogleDriveLink | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (!isDriveHost(url)) return null;

  return parseDrivePath(url);
}

function isDriveHost(url: URL): boolean {
  return url.hostname === "drive.google.com" || url.hostname === "drive.usercontent.google.com";
}

function parseDrivePath(url: URL): GoogleDriveLink | null {
  if (url.pathname.startsWith("/drive/folders/")) {
    return { kind: "unsupported-folder" };
  }

  const fileMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) {
    return { kind: "file", fileId: fileMatch[1] };
  }

  const idParam = url.searchParams.get("id");
  if (idParam) {
    return { kind: "file", fileId: idParam };
  }

  return null;
}

/** Google Drive's actual content-serving endpoint — confirmed CORS-open (access-control-allow-origin: *). */
export function buildGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
}
