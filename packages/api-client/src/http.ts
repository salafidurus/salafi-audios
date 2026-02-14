export type HttpClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | undefined | null;
};

type QueryParamValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

let config: HttpClientConfig | null = null;

export function configureApiClient(next: HttpClientConfig) {
  config = next;
}

export async function httpClient<T>(options: {
  url: string;
  method: string;
  params?: QueryParams;
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

  const endpoint = new URL(`${config.baseUrl}${options.url}`);

  if (options.params) {
    for (const [key, raw] of Object.entries(options.params)) {
      if (Array.isArray(raw)) {
        for (const item of raw) {
          if (item !== undefined && item !== null) {
            endpoint.searchParams.append(key, String(item));
          }
        }
        continue;
      }

      if (raw !== undefined && raw !== null) {
        endpoint.searchParams.set(key, String(raw));
      }
    }
  }

  const res = await fetch(endpoint.toString(), {
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
