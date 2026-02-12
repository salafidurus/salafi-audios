import { z } from "zod";

export const AppEnvSchema = z.enum(["development", "preview", "production"]);
export type AppEnv = z.infer<typeof AppEnvSchema>;

/**
 * Build-time env read from process.env in app.config.ts (EAS injects these).
 * This is what you validate inside app.config.ts.
 */
const MobileBuildEnvSchema = z.object({
  APP_ENV: AppEnvSchema.default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
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

/**
 * Runtime shape of expo.extra that we expect to exist.
 * You validate it where you read it at runtime (Constants.expoConfig?.extra).
 */
const MobileRuntimeExtraSchema = z.object({
  appEnv: AppEnvSchema,
  apiUrl: z.string().url(),
});

export type MobileRuntimeExtra = z.infer<typeof MobileRuntimeExtraSchema>;

export function parseMobileRuntimeExtra(extra: unknown): MobileRuntimeExtra {
  const parsed = MobileRuntimeExtraSchema.safeParse(extra);
  if (!parsed.success) {
    throw new Error(
      [
        "Invalid MOBILE runtime extra.",
        "Make sure app.config.ts sets extra.appEnv and extra.apiUrl correctly.",
        parsed.error.message,
      ].join("\n"),
    );
  }
  return parsed.data;
}
