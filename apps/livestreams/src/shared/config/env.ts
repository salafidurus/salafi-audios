import { z } from "zod";

const LiveEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  DATABASE_URL: z.string().url(),
  TELEGRAM_API_ID: z.coerce.number().int().positive(),
  TELEGRAM_API_HASH: z.string().min(1),
  TELEGRAM_SESSION: z.string().default(""),
  INTERNAL_SECRET: z.string().min(16),
  API_URL: z.string().url().default("http://localhost:4000"),
  LIVESTREAM_SECRET: z.string().default("local-dev-secret"),
});

export type LiveEnv = z.infer<typeof LiveEnvSchema>;

export function getLiveEnv(raw: NodeJS.ProcessEnv = process.env): LiveEnv {
  const parsed = LiveEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid livestreams environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
