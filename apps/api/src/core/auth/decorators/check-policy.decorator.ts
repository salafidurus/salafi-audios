import { SetMetadata } from '@nestjs/common';
import type { PrimaryDbService } from '../../db/primary-db.service';
import type { AppActions, AppSubjectType } from '../ability/ability.types';
import type { PolicyResource } from '../policy';

/** Core API check policy.decorator module providing shared backend infrastructure and authority-boundary services. */
export type { PolicyResource } from '../policy';

/** Runtime API declaration for check policy key. */
export const CHECK_POLICY_KEY = 'checkPolicy';

/** API type describing the policy request context contract. */
export type PolicyRequestContext = {
  params: Record<string, string>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
};

/** API type describing the policy resource resolver contract. */
export type PolicyResourceResolver = (
  ctx: PolicyRequestContext,
  prisma: PrimaryDbService,
) => Promise<PolicyResource> | PolicyResource;

/** API type describing the check policy metadata contract. */
export type CheckPolicyMetadata = {
  action: AppActions;
  subjectType: AppSubjectType;
  resolve?: PolicyResourceResolver;
};

/**
 * Declares the CASL ability check a route requires.
 * When `resolve` is provided, its return value is passed as the resource
 * conditions checked against the subject type (e.g. { scholarSlug } for a Listing).
 */
export const CheckPolicy = (
  action: AppActions,
  subjectType: AppSubjectType,
  resolve?: PolicyResourceResolver,
) => {
  const metadata: CheckPolicyMetadata = { action, subjectType, resolve };
  return SetMetadata(CHECK_POLICY_KEY, metadata);
};
