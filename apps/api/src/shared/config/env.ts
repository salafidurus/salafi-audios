import { z } from 'zod';

const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.url(),
  ASSET_CDN_BASE_URL: z.url().optional(),
  SITEMAP_BASE_URL: z.url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  APPLE_CLIENT_ID: z.string(),
  APPLE_CLIENT_SECRET: z.string(),
  // Telegram monitor (merged from apps/livestreams)
  TELEGRAM_API_ID: z.coerce.number().int().positive().optional(),
  TELEGRAM_API_HASH: z.string().optional(),
  TELEGRAM_SESSION: z.string().optional(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.url(),
  DISABLE_THROTTLER: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(false),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function getApiEnv(raw: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = ApiEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid API environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
