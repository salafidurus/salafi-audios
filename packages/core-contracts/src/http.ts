/** HTTP client configuration for platform-specific authentication.
 *
 * Authentication modes (in priority order):
 * 1. **Web (cookies)**: Session cookies set by API are sent automatically via
 *    `credentials: 'include'`. No token provider needed.
 * 2. **Native (cookie forwarding)**: @better-auth/expo stores session cookie
 *    in SecureStore. Use `getCookie()` to retrieve and forward via Cookie header.
 * 3. **Legacy (bearer tokens)**: For backward compatibility. Use `getAccessToken()`
 *    to provide a bearer token. Note: this mode is deprecated.
 */
export type HttpClientConfig = {
  baseUrl: string;
  /** (Optional) Legacy bearer token provider for backward compatibility.
   * Primary auth is via cookies (credentials: 'include'). */
  getAccessToken?: () => string | undefined | null;
  /** (Required for native) Session cookie provider. RN fetch has no cookie jar,
   * so must manually forward session cookie via Cookie header. */
  getCookie?: () => string | undefined | null;
  /** Active content locale; sent as `Accept-Language` so the API resolves
   * translations to the user's selected language. */
  getLocale?: () => string | undefined | null;
  /** (Optional) Callback for non-2xx responses (e.g., session expiry on 401). */
  onError?: (status: number) => void;
};

type QueryParamValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

let config: HttpClientConfig | null = null;

export function configureApiClient(next: HttpClientConfig) {
  config = next;
}

export function getApiBaseUrl(): string {
  return config?.baseUrl ?? "";
}

export async function httpClient<T>(options: {
  url: string;
  method: string;
  params?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  data?: unknown;
  signal?: AbortSignal;
}): Promise<T> {
  if (!config) {
    throw new Error(
      "API client is not configured. Call configureApiClient({ baseUrl }) at app startup.",
    );
  }

  const token = config.getAccessToken?.() ?? undefined;
  const cookie = config.getCookie?.() ?? undefined;
  const locale = config.getLocale?.() ?? undefined;

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

  const payload = options.body ?? options.data;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  // If the caller passed their own signal, abort our controller when theirs does
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res: Response;

  try {
    res = await fetch(endpoint.toString(), {
      method: options.method,
      // Send cookies automatically (web via browser, native via @better-auth/expo).
      // Cookies are sent via either credentials:"include" (web) or Cookie header
      // (native). For native, getCookie() will override via headers below.
      credentials: "include",
      headers: {
        ...(payload !== undefined && payload !== null
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(locale ? { "Accept-Language": locale } : {}),
        ...options.headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal as any,
    });
  } catch {
    throw new Error("Network request failed. Check API availability and base URL configuration.");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    config.onError?.(res.status);
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
