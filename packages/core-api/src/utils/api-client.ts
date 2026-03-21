import { getApiBaseUrl } from "@sd/core-config";
import {
  type HttpClientConfig,
  httpClient,
  initApiClient as initContractsApiClient,
} from "@sd/core-contracts";

export type ApiRequestOptions = Parameters<typeof httpClient>[0];

export type ApiInterceptor = {
  onRequest?: (options: ApiRequestOptions) => ApiRequestOptions;
  onResponse?: <T>(data: T, options: ApiRequestOptions) => T;
  onError?: (error: unknown, options: ApiRequestOptions) => void;
};

const interceptors: ApiInterceptor[] = [];
let accessTokenProvider: HttpClientConfig["getAccessToken"];

export function registerApiInterceptor(interceptor: ApiInterceptor) {
  interceptors.push(interceptor);
  return () => {
    const index = interceptors.indexOf(interceptor);
    if (index >= 0) {
      interceptors.splice(index, 1);
    }
  };
}

export function setAccessTokenProvider(provider: HttpClientConfig["getAccessToken"]) {
  accessTokenProvider = provider;
}

export function initApiClient(config?: Pick<HttpClientConfig, "baseUrl">) {
  const baseUrl = config?.baseUrl ?? getApiBaseUrl();
  if (!baseUrl) {
    console.error(
      "API client initialization failed: No baseUrl provided. Set NEXT_PUBLIC_API_URL environment variable.",
    );
    return;
  }

  initContractsApiClient({
    baseUrl,
    getAccessToken: () => accessTokenProvider?.(),
  });
}

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  let nextOptions = options;
  for (const interceptor of interceptors) {
    if (interceptor.onRequest) {
      nextOptions = interceptor.onRequest(nextOptions);
    }
  }

  try {
    let response = await httpClient<T>(nextOptions);
    for (const interceptor of interceptors) {
      if (interceptor.onResponse) {
        response = interceptor.onResponse(response, nextOptions);
      }
    }
    return response;
  } catch (error) {
    for (const interceptor of interceptors) {
      interceptor.onError?.(error, nextOptions);
    }
    throw error;
  }
}
