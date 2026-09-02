type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchLatestVersion(
  packageName: string,
  fetchFn: Fetcher = fetch,
): Promise<string | null> {
  try {
    const res = await fetchFn(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    // SAFETY: the npm registry latest endpoint returns a JSON object whose optional version field is read below.
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}
