/** Documents this module's responsibility and public boundary. */
const ONEDRIVE_HOSTS = [/(^|\.)1drv\.ms$/, /(^|\.)onedrive\.live\.com$/, /\.sharepoint\.com$/];

const ONEDRIVE_MESSAGE =
  "OneDrive links require Microsoft sign-in even when shared publicly — this can't be downloaded directly from the browser. Download it locally and upload the file instead.";

/**
 * Detects hosts confirmed to be unreachable from a pure client-side fetch (auth walls,
 * not CORS), so the UI can show a specific message before ever attempting a request.
 */
export function isKnownUnsupportedSource(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (ONEDRIVE_HOSTS.some((pattern) => pattern.test(url.hostname))) {
    return ONEDRIVE_MESSAGE;
  }

  return null;
}
