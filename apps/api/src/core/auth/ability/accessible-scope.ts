import type { AppAbility, AppActions, AppSubjectType } from './ability.types';

/**
 * Hand-rolled scope-list helper for scope-aware list endpoints (the D4
 * fallback from the migration plan — @casl/prisma's typed `accessibleBy`
 * needs a generated Prisma WhereInput type map this repo doesn't set up,
 * so this reads the ability's own conditioned rules directly instead).
 *
 * Returns `undefined` when the caller has unconditioned (global) access —
 * callers should apply no filter in that case. Otherwise returns the set of
 * ids their conditioned rules allow (possibly empty, meaning no access).
 */
export function accessibleScopeIds(
  ability: AppAbility,
  action: AppActions,
  subjectType: AppSubjectType,
  conditionKey: 'id' | 'scholarId' = 'scholarId',
): string[] | undefined {
  const rules = ability.rulesFor(action, subjectType);
  const ids = new Set<string>();

  for (const rule of rules) {
    if (rule.inverted) continue;
    if (!rule.conditions) return undefined; // unconditioned rule => global access
    const value = (rule.conditions as Record<string, unknown>)[conditionKey];
    if (typeof value === 'string') ids.add(value);
  }

  return Array.from(ids);
}
