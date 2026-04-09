import { z } from "zod";

const WebPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
});

export type WebPublicEnv = z.infer<typeof WebPublicEnvSchema>;

function getWebPublicEnv(raw: Record<string, unknown> = process.env): WebPublicEnv {
  const parsed = WebPublicEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid WEB PUBLIC environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}

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
