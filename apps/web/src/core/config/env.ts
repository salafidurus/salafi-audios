import { z } from "zod";

const WebPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WEB_URL: z.string().url(),
});

export type WebPublicEnv = z.infer<typeof WebPublicEnvSchema>;

export function validateEnv(raw: Record<string, unknown> = process.env): WebPublicEnv {
  const parsed = WebPublicEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((err) => `- ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`\n\n❌ Invalid WEB environment variables:\n${details}\n`);
  }
  return parsed.data;
}

export type WebRuntimeEnv = {
  apiUrl?: string;
  webUrl?: string;
};

export const isDev = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isPreview = !isDev && !isProduction;

export function getWebRuntimeEnv(): WebRuntimeEnv {
  if (process.env.NODE_ENV === "test") {
    return {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    };
  }

  const env = validateEnv();
  return {
    apiUrl: env.NEXT_PUBLIC_API_URL,
    webUrl: env.NEXT_PUBLIC_WEB_URL,
  };
}

export function getApiBaseUrl(): string | undefined {
  return getWebRuntimeEnv().apiUrl;
}
