import { z } from "zod";

/** Defines and validates the public URLs required by the web runtime. */
const WebPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_WEB_URL: z.url(),
});

/** Validated public origins required for API calls and canonical web URLs. */
export type WebPublicEnv = z.infer<typeof WebPublicEnvSchema>;

/** Validates runtime environment values and reports every missing or malformed public variable. */
export function validateEnv(
  raw: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): WebPublicEnv {
  const parsed = WebPublicEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((err) => `- ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`\n\n❌ Invalid WEB environment variables:\n${details}\n`);
  }
  return parsed.data;
}

/** Runtime URL shape that remains optional in tests but is complete in production. */
export type WebRuntimeEnv = {
  apiUrl?: string;
  webUrl?: string;
};

/** Indicates development mode without requiring callers to read process.env directly. */
export const isDev = process.env.NODE_ENV === "development";

/** Returns the API and web origins, preserving test environments with optional URLs. */
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

/** Returns the configured API origin used by the shared HTTP client. */
export function getApiBaseUrl(): string | undefined {
  return getWebRuntimeEnv().apiUrl;
}
