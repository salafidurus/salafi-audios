import { z } from "zod";

/**
 * Client-safe env (must be NEXT_PUBLIC_*).
 * Use this anywhere that can run in the browser.
 */
const WebPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
});

export type WebPublicEnv = z.infer<typeof WebPublicEnvSchema>;

export function getWebPublicEnv(raw: Record<string, unknown> = process.env): WebPublicEnv {
  const parsed = WebPublicEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid WEB PUBLIC environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}

/**
 * Server-only env can go here later (no NEXT_PUBLIC_ prefix).
 * Keep empty for Phase 01 unless you already need server secrets.
 */
const WebServerEnvSchema = z.object({});

export type WebServerEnv = z.infer<typeof WebServerEnvSchema>;

export function getWebServerEnv(raw: Record<string, unknown> = process.env): WebServerEnv {
  const parsed = WebServerEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid WEB SERVER environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
