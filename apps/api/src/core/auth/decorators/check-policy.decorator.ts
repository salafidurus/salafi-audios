import { SetMetadata } from '@nestjs/common';
import type { Locale } from '@sd/core-contracts';
import type { PrismaService } from '../../db/prisma.service';
import type { AppActions, AppSubjectType } from '../ability/ability.types';

export const CHECK_POLICY_KEY = 'checkPolicy';

export type PolicyRequestContext = {
  params: Record<string, string>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
};

export type PolicyResource = {
  slug?: string;
  scholarSlug?: string;
  locale?: Locale;
};

export type PolicyResourceResolver = (
  ctx: PolicyRequestContext,
  prisma: PrismaService,
) => Promise<PolicyResource> | PolicyResource;

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
