import { z } from "zod";

const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:3001"),
  DATABASE_URL: z.string().url().optional(),
  ASSET_CDN_BASE_URL: z.string().url().optional(),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function getApiEnv(raw: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = ApiEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid API environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
