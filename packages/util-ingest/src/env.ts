import { z } from "zod";

const DbEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_DB_URL: z.string().url().optional(),
  SHADOW_DATABASE_URL: z.string().url().optional(),
});

export type DbEnv = z.infer<typeof DbEnvSchema>;

export function getDbEnv(raw: NodeJS.ProcessEnv = process.env): DbEnv {
  const parsed = DbEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid DB environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
