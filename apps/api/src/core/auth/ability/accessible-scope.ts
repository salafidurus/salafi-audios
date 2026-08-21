import type { AppAbility, AppActions, AppSubjectType } from './ability.types';

type ScopeConditionKey = 'slug' | 'scholarSlug';
type ScopedRuleConditions = Partial<Record<ScopeConditionKey, string>>;

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
  conditionKey: ScopeConditionKey = 'scholarSlug',
): string[] | undefined {
  const rules = ability.rulesFor(action, subjectType);
  const ids = new Set<string>();

  for (const rule of rules) {
    if (rule.inverted) continue;
    if (!rule.conditions) return undefined; // unconditioned rule => global access
    // SAFETY: this helper only reads the two string condition keys that
    // `defineAbilityFor` writes for scoped CASL rules in this codebase.
    const value = (rule.conditions as ScopedRuleConditions)[conditionKey];
    if (value) ids.add(value);
  }

  return Array.from(ids);
}
