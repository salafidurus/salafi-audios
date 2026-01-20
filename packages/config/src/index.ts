import { z } from "zod";

/**
 * Shared configuration principles:
 * - Only put PUBLIC-safe config here if it may be consumed by clients.
 * - Backend secrets must be defined/validated in the API app only.
 * - Prefer explicit env schemas over ad-hoc process.env access.
 */

/**
 * Public config that is safe for clients (web/mobile).
 * Examples: API base URL, CDN base URL, environment name.
 */
export const PublicEnvSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]),
  PUBLIC_API_BASE_URL: z.string().url(),
  PUBLIC_MEDIA_BASE_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof PublicEnvSchema>;

export function parsePublicEnv(env: Record<string, unknown>): PublicEnv {
  return PublicEnvSchema.parse(env);
}
