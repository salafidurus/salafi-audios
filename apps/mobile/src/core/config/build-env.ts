import { z } from "zod";

export const AppEnvSchema = z.enum(["development", "preview", "production"]);
export type AppEnv = z.infer<typeof AppEnvSchema>;

const MobileBuildEnvSchema = z.object({
  APP_ENV: AppEnvSchema.default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url(),
  EXPO_PUBLIC_SENTRY_ORG: z.string(),
  EXPO_PUBLIC_SENTRY_PROJECT: z.string(),
  EXPO_PUBLIC_VEXO_PROJECT_ID: z.string(),
});

export type MobileBuildEnv = z.infer<typeof MobileBuildEnvSchema>;

export function getMobileBuildEnv(raw: NodeJS.ProcessEnv = process.env): MobileBuildEnv {
  const parsed = MobileBuildEnvSchema.safeParse(raw);
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
