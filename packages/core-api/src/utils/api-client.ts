import { type HttpClientConfig, initApiClient as initContractsApiClient } from "@sd/core-contracts";

let accessTokenProvider: HttpClientConfig["getAccessToken"];
let cookieProvider: HttpClientConfig["getCookie"];
let localeProvider: HttpClientConfig["getLocale"];
let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function setAccessTokenProvider(provider: HttpClientConfig["getAccessToken"]) {
  accessTokenProvider = provider;
}

export function setCookieProvider(provider: HttpClientConfig["getCookie"]) {
  cookieProvider = provider;
}

export function setLocaleProvider(provider: HttpClientConfig["getLocale"]) {
  localeProvider = provider;
}

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
