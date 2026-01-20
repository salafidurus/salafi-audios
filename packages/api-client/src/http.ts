export type HttpClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | undefined | null;
};

let config: HttpClientConfig | null = null;

export function configureApiClient(next: HttpClientConfig) {
  config = next;
}

export async function httpClient<T>(options: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}): Promise<T> {
  if (!config) {
    throw new Error(
      "API client is not configured. Call configureApiClient({ baseUrl }) at app startup.",
    );
  }

  const token = config.getAccessToken?.() ?? undefined;

  const res = await fetch(`${config.baseUrl}${options.url}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  // allow empty responses
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }

  return (await res.json()) as T;
}
