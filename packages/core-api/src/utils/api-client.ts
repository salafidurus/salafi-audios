import { type HttpClientConfig, initApiClient as initContractsApiClient } from "@sd/core-contracts";

/** Adapts application-specific authentication and locale providers to the shared HTTP client. */
let accessTokenProvider: HttpClientConfig["getAccessToken"];
let cookieProvider: HttpClientConfig["getCookie"];
let localeProvider: HttpClientConfig["getLocale"];
let unauthorizedHandler: (() => void) | undefined;

/** Registers the callback invoked when the shared client receives an unauthorized response. */
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

/** Supplies the optional legacy bearer-token source to the shared client. */
export function setAccessTokenProvider(provider: HttpClientConfig["getAccessToken"]) {
  accessTokenProvider = provider;
}

/** Supplies the native session-cookie source to the shared client. */
export function setCookieProvider(provider: HttpClientConfig["getCookie"]) {
  cookieProvider = provider;
}

/** Supplies the active content-locale source to the shared client. */
export function setLocaleProvider(provider: HttpClientConfig["getLocale"]) {
  localeProvider = provider;
}

/** Initializes the shared client and reports missing application API configuration. */
export function initApiClient(config?: Pick<HttpClientConfig, "baseUrl">) {
  const baseUrl = config?.baseUrl;
  if (!baseUrl) {
    console.error(
      "API client initialization failed: No baseUrl provided. Set NEXT_PUBLIC_API_URL environment variable.",
    );
    return;
  }

  initContractsApiClient({
    baseUrl,
    getAccessToken: () => accessTokenProvider?.(),
    getCookie: () => cookieProvider?.(),
    getLocale: () => localeProvider?.(),
    onError: (status) => {
      if (status === 401) unauthorizedHandler?.();
    },
  });
}
