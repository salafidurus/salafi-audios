import { getWebPublicEnv } from "@sd/env";

export type WebRuntimeEnv = {
  apiUrl?: string;
};

const nodeEnv = process.env.NODE_ENV;

export const isDev = nodeEnv === "development";
export const isProduction = nodeEnv === "production";
export const isPreview = !isDev && !isProduction;

export function getWebRuntimeEnv(): WebRuntimeEnv {
  let env: ReturnType<typeof getWebPublicEnv> | null = null;

  try {
    env = getWebPublicEnv();
  } catch {
    env = null;
  }

  return {
    apiUrl: env?.NEXT_PUBLIC_API_URL,
  };
}

export function getApiBaseUrl(): string | undefined {
  return getWebRuntimeEnv().apiUrl;
}
