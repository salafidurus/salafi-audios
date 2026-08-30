import { SetMetadata } from '@nestjs/common';

import type { RateLimitPolicyName } from './rate-limit.policy';

/** Stable Nest metadata key shared by the route decorator and RateLimitGuard. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The surrounding TSDoc documents this internal framework key; its literal has no independent caller contract.
export const RATE_LIMIT_POLICY_KEY = 'rateLimitPolicy';

/**
 * Marks a controller or route with an explicit traffic policy.
 *
 * Explicit metadata takes precedence over the guard's public/authenticated
 * fallback, keeping expensive and sensitive endpoints visible in their owner.
 */
export const RateLimitPolicy = (policy: RateLimitPolicyName) =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, policy);
