import { subject } from '@casl/ability';
import type { Locale } from '@sd/core-contracts';

import { defineAbilityFor } from './ability/ability.factory';
import type { AbilityInput, AppActions, AppSubjectType } from './ability/ability.types';

/** Resource identity supplied by an adapter after it has resolved a request. */
export type PolicyResource = {
  slug?: string;
  scholarSlug?: string;
  locale?: Locale;
};

export type PolicyCheck = {
  action: AppActions;
  subjectType: AppSubjectType;
  resource?: PolicyResource;
  /** True when an adapter attempted to resolve the resource. */
  resourceResolved?: boolean;
};

function hasDefinedValue(value: string | undefined): value is string {
  return value !== undefined && value.length > 0;
}

function copyPolicyResource(resource: PolicyResource): PolicyResource {
  const normalized: PolicyResource = {};
  if (resource.slug !== undefined) normalized.slug = resource.slug;
  if (resource.scholarSlug !== undefined) normalized.scholarSlug = resource.scholarSlug;
  if (resource.locale !== undefined) normalized.locale = resource.locale;
  return normalized;
}

function requiredScopeFor(
  subjectType: AppSubjectType,
  resource: PolicyResource,
): string | undefined {
  if (subjectType === 'Scholar') return resource.slug;
  if (subjectType === 'Listing' || subjectType === 'Media') return resource.scholarSlug;
  return undefined;
}

function hasRequiredResolvedScope(subjectType: AppSubjectType, resource: PolicyResource): boolean {
  if (subjectType === 'Translation') return hasDefinedValue(resource.locale);
  if (subjectType === 'Scholar' || subjectType === 'Listing' || subjectType === 'Media') {
    return hasDefinedValue(requiredScopeFor(subjectType, resource));
  }
  return true;
}

/**
 * Normalizes resource scope into the condition shape emitted by the policy.
 * An adapter that resolved a missing resource is distinguishable from a route
 * that intentionally has no resource (for example, create or global access).
 */
export function normalizePolicyResource(
  subjectType: AppSubjectType,
  resource: PolicyResource | undefined,
  resourceResolved = false,
): PolicyResource | undefined {
  if (!resource) {
    return resourceResolved ? undefined : {};
  }

  const normalized = copyPolicyResource(resource);
  if (resourceResolved && !hasRequiredResolvedScope(subjectType, normalized)) return undefined;

  if (Object.values(normalized).some((value) => value === undefined || value === ''))
    return undefined;
  return normalized;
}

/**
 * Framework-free backend authorization seam. Every request either supplies a
 * resolved resource or is evaluated against an empty subject, which prevents
 * conditioned grants from becoming global grants accidentally.
 */
export function canAccess(input: AbilityInput, check: PolicyCheck): boolean {
  const normalized = normalizePolicyResource(
    check.subjectType,
    check.resource,
    check.resourceResolved,
  );
  if (check.resourceResolved && !normalized) return false;

  const ability = defineAbilityFor(input);
  // SAFETY: normalized resources contain only the scope fields accepted by
  // the shared AppSubjects vocabulary; dynamic subject dispatch is the policy seam.
  const target = subject(check.subjectType, (normalized ?? {}) as never);
  return ability.can(check.action, target);
}
