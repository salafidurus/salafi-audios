import { z } from 'zod';

/** Validated environment contract for API infrastructure and operational telemetry. */
const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

/** Core API env module providing shared backend infrastructure and authority-boundary services. */
const ApiEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    CORS_ORIGINS_NATIVE: z.string().optional().default('salafidurus-dev://,exp://'),
    PRIMARY_DATABASE_URL: z.url(),
    PRIMARY_DIRECT_DATABASE_URL: z.url().optional(),
    PRIMARY_SHADOW_DATABASE_URL: z.url().optional(),
    ANALYTICS_DATABASE_URL: z.url(),
    ANALYTICS_IDENTITY_HMAC_SECRET: z.string().min(32),
    // Neon control-plane credentials power the /health compute-endpoint check.
    // Optional in development/test; required together and required in prod.
    NEON_API_KEY: z.string().min(1).optional(),
    NEON_PROJECT_ID: z.string().min(1).optional(),
    NEON_ENDPOINT_ID: z
      .string()
      .regex(/^ep-[a-z0-9-]{1,60}$/)
      .optional(),
    PRISMA_LOG_QUERIES: z
      .preprocess((val) => val === 'true' || val === true, z.boolean())
      .default(false),
    ASSET_CDN_BASE_URL: z.url().optional(),
    SITEMAP_BASE_URL: z.url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    COOKIE_DOMAIN: z.string().default('salafidurus.com'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    APPLE_CLIENT_ID: z.string(),
    APPLE_CLIENT_SECRET: z.string(),
    REDIS_URL: z.url().optional(),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    R2_PUBLIC_BASE_URL: z.url(),
    R2_PRESIGN_EXPIRES_SECONDS: z.coerce.number().int().positive().default(3600),
    DISABLE_THROTTLER: z
      .preprocess((val) => val === 'true' || val === true, z.boolean())
      .default(false),
    OTEL_SERVICE_NAME: optionalString.default('salafi-durus-api'),
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalString,
    OTEL_EXPORTER_OTLP_HEADERS: optionalString,
    OTEL_EXPORTER_OTLP_PROTOCOL: z.enum(['http/protobuf', 'grpc']).default('http/protobuf'),
    OTEL_EXPORTER_OTLP_COMPRESSION: z.enum(['none', 'gzip']).default('gzip'),
    OTEL_REGION: optionalString.default('unknown'),
    OTEL_DEPLOYMENT_VERSION: optionalString.default('unknown'),
    OTEL_PLATFORM: z.literal('api').default('api'),
    OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: z.coerce.number().int().positive().default(4095),
  })
  .superRefine((env, ctx) => {
    const providedNeonVars = [env.NEON_API_KEY, env.NEON_PROJECT_ID, env.NEON_ENDPOINT_ID].filter(
      (value) => value !== undefined,
    ).length;

    if (providedNeonVars > 0 && providedNeonVars < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEON_API_KEY'],
        message: 'NEON_API_KEY, NEON_PROJECT_ID, and NEON_ENDPOINT_ID must be provided together',
      });
    }

    // Preview and production deploy with NODE_ENV=production, so gate on
    // "not development" rather than "is production".
    if (env.NODE_ENV !== 'development' && providedNeonVars < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEON_API_KEY'],
        message:
          'NEON_API_KEY, NEON_PROJECT_ID, and NEON_ENDPOINT_ID are required unless NODE_ENV=development',
      });
    }
  });

/** API type describing the api env contract. */
export type ApiEnv = z.infer<typeof ApiEnvSchema>;

/** Resolves get api env behavior while preserving the API boundary contract. */
export function getApiEnv(raw: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = ApiEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid API environment variables:\n${parsed.error.message}`);
  }
  return parsed.data;
}
