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
   * so must manually forward session cookie via Cookie header.
   * May return a promise: @better-auth/expo >= 1.7 reads SecureStore
   * asynchronously (`client.getCookie(): Promise<string>`). */
  getCookie?: () => string | undefined | null | Promise<string | undefined | null>;
  /** Active content locale; sent as `Accept-Language` so the API resolves
   * translations to the user's selected language. */
  getLocale?: () => string | undefined | null;
  /** (Optional) Callback for non-2xx responses (e.g., session expiry on 401). */
  onError?: (status: number) => void;
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`API ${status} ${statusText}: ${body}`);
    this.name = "HttpError";
  }
}

type QueryParamValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

let config: HttpClientConfig | null = null;

function appendQueryParams(endpoint: URL, params?: QueryParams): void {
  if (!params) return;

  for (const [key, raw] of Object.entries(params)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const item of values) {
      if (item !== undefined && item !== null) {
        endpoint.searchParams[Array.isArray(raw) ? "append" : "set"](key, String(item));
      }
    }
  }
}

function buildHeaders(
  options: { headers?: Record<string, string>; body?: unknown; data?: unknown },
  auth: { token?: string; cookie?: string; locale?: string },
) {
  const headers = { ...options.headers };
  const payload = options.body ?? options.data;

  if (payload !== undefined && payload !== null) headers["Content-Type"] = "application/json";
  if (auth.token) headers["Authorization"] ??= `Bearer ${auth.token}`;
  if (auth.cookie) headers["Cookie"] ??= auth.cookie;
  if (auth.locale) headers["Accept-Language"] ??= auth.locale;

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // SAFETY: callers choose T to match the endpoint's non-JSON response contract.
    return (await response.text()) as T;
  }

  // SAFETY: callers choose T to match the endpoint's JSON response contract.
  return (await response.json()) as T;
}

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
  const cookie = (await config.getCookie?.()) ?? undefined;
  const locale = config.getLocale?.() ?? undefined;

  const endpoint = new URL(`${config.baseUrl}${options.url}`);

  appendQueryParams(endpoint, options.params);

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
      headers: buildHeaders(options, { token, cookie, locale }),
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new Error("Network request failed. Check API availability and base URL configuration.");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    config.onError?.(res.status);
    const text = await res.text().catch(() => "");
    throw new HttpError(res.status, res.statusText, text);
  }

  // allow empty responses
  // SAFETY: the caller chooses T to match the endpoint's declared response contract.
  return parseResponse<T>(res);
}
