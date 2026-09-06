import type { FastifyRequest } from 'fastify';

/**
 * Names the API traffic classes available to route metadata.
 *
 * Every name maps to a concrete budget and storage-failure policy; routes
 * without an explicit name use the public-read or authenticated fallback.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc is the complete caller contract for this union type.
export type RateLimitPolicyName =
  | 'global-safety'
  | 'public-read'
  | 'authenticated'
  | 'authentication'
  | 'admin-write'
  | 'expensive-search'
  | 'analytics-ingest'
  | 'health-probe';

/** Runtime mode that changes limits without changing route classification. */
export type RateLimitMode = 'development' | 'test' | 'production';

/** A policy's request budget and whether it participates in the ordinary ceiling. */
export type RateLimitPolicy = {
  name: RateLimitPolicyName;
  limit: number;
  timeWindowMs: number;
  appliesGlobalSafety: boolean;
  /** Storage failures preserve API availability instead of turning into 5xx responses. */
  failureMode: 'open';
};

const productionPolicies = {
  'global-safety': {
    name: 'global-safety',
    limit: 600,
    timeWindowMs: 60_000,
    appliesGlobalSafety: false,
    failureMode: 'open',
  },
  'public-read': {
    name: 'public-read',
    limit: 120,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  authenticated: {
    name: 'authenticated',
    limit: 60,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  authentication: {
    name: 'authentication',
    limit: 10,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  'admin-write': {
    name: 'admin-write',
    limit: 30,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  'expensive-search': {
    name: 'expensive-search',
    limit: 20,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  'analytics-ingest': {
    name: 'analytics-ingest',
    limit: 60,
    timeWindowMs: 60_000,
    appliesGlobalSafety: true,
    failureMode: 'open',
  },
  'health-probe': {
    name: 'health-probe',
    limit: 30,
    timeWindowMs: 10_000,
    appliesGlobalSafety: false,
    failureMode: 'open',
  },
} satisfies Record<RateLimitPolicyName, RateLimitPolicy>;

/**
 * Resolves the selected policy for the current runtime mode.
 *
 * Test mode intentionally uses the existing two-requests-per-second budget so
 * rejection behavior remains fast and deterministic. Disabled mode is handled
 * by the enforcement boundary rather than by pretending a large budget is a
 * real policy.
 */
export function getRateLimitPolicy(
  name: RateLimitPolicyName,
  mode: RateLimitMode,
): RateLimitPolicy {
  const policy = productionPolicies[name];
  if (mode !== 'test') return policy;
  return { ...policy, limit: 2, timeWindowMs: 1_000 };
}

/**
 * Resolves route metadata into a named policy.
 *
 * Explicit metadata is authoritative. Routes without metadata retain a safe
 * public-read or authenticated fallback so a newly added route cannot become
 * accidentally unlimited.
 */
export function resolveRateLimitPolicy(
  explicitPolicy: RateLimitPolicyName | undefined,
  isPublic: boolean,
): RateLimitPolicyName {
  return explicitPolicy ?? (isPublic ? 'public-read' : 'authenticated');
}

/**
 * Selects the request identity used for a rate-limit bucket.
 *
 * An authenticated principal is authoritative because it comes from the
 * backend session guard. Anonymous requests use Fastify's resolved `request.ip`,
 * which only incorporates forwarded headers when proxy trust is configured.
 */
export function getRateLimitIdentity(request: FastifyRequest): string {
  // SAFETY: AuthGuard attaches the optional session user to the Fastify request;
  // the intersection only describes that existing runtime augmentation.
  const userId = (request as FastifyRequest & { user?: { id?: string } }).user?.id;
  return userId ? `user:${userId}` : `ip:${request.ip}`;
}
