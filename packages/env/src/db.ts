// packages/env/src/db.ts
import { z } from "zod";

const DbEnvSchema = z.object({
  DATABASE_URL: z.string().url(), // MUST be direct Neon URL for migrations
  DIRECT_DB_URL: z.string().url().optional(), // runtime apps can use this
  SHADOW_DATABASE_URL: z.string().url().optional(), // only needed if prisma demands shadow db
});

export type DbEnv = z.infer<typeof DbEnvSchema>;

export function getDbEnv(raw: NodeJS.ProcessEnv = process.env): DbEnv {
  const parsed = DbEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid DB environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
