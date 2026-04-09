import { z } from "zod";

export const AppEnvSchema = z.enum(["development", "preview", "production"]);
export type AppEnv = z.infer<typeof AppEnvSchema>;

const BuildEnvSchema = z.object({
  APP_ENV: AppEnvSchema.default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url(),
  EXPO_PUBLIC_SENTRY_ORG: z.string(),
  EXPO_PUBLIC_SENTRY_PROJECT: z.string(),
  EXPO_PUBLIC_VEXO_PROJECT_ID: z.string(),
});

export type BuildEnv = z.infer<typeof BuildEnvSchema>;

export function getBuildEnv(raw: NodeJS.ProcessEnv = process.env): BuildEnv {
  const parsed = BuildEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      [
        "Invalid MOBILE build environment variables.",
        "Fix your EAS env vars (or local env) and rebuild.",
        parsed.error.message,
      ].join("\n"),
    );
  }
  return parsed.data;
}
