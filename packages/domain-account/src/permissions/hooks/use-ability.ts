import type { AppAbility, AppActions, AppSubjectType } from "@sd/core-contracts";

import { createMongoAbility, subject } from "@casl/ability";
import { unpackRules } from "@casl/ability/extra";

import { useAccountProfile } from "../../account.api";

export interface UseAbilityOptions {
  isAuthenticated?: boolean;
  enabled?: boolean;
}

/** Rebuilds a CASL ability from a packed rules array (see UserProfileDto.rules). */
export function buildAbilityFromRules(rules: unknown[] | undefined): AppAbility {
  return createMongoAbility(unpackRules((rules ?? []) as never)) as AppAbility;
}

/**
 * Rebuilds the caller's CASL ability from the packed rules on their profile
 * (see UserProfileDto.rules) — identical API on web and native. This is
 * convenience-only UI gating; the backend PolicyGuard re-checks every
 * request regardless of what this hook returns.
 */
export function useAbility(options?: UseAbilityOptions): {
  ability: AppAbility;
  isLoading: boolean;
} {
  const { isAuthenticated, enabled } = options ?? {};
  const queryEnabled = enabled ?? (isAuthenticated !== undefined ? isAuthenticated : true);

  const { data: profile, isLoading } = useAccountProfile({ enabled: queryEnabled });

  return {
    ability: buildAbilityFromRules(profile?.rules),
    isLoading: !queryEnabled ? false : isLoading,
  };
}

/**
 * Thin convenience wrapper over useAbility().ability.can(...) for call sites
 * that only need a boolean, not the ability instance itself.
 */
export function useCan(
  action: AppActions,
  subjectType: AppSubjectType,
  conditions?: Record<string, unknown>,
  options?: UseAbilityOptions,
): boolean {
  const { ability } = useAbility(options);
  // The caller's conditions shape is only known at each call site, not to
  // this generic hook — same dynamic-dispatch boundary as the backend's
  // PolicyGuard; correctness is verified by ability.factory/use-ability specs.
  return conditions
    ? ability.can(action, subject(subjectType, conditions as never))
    : ability.can(action, subjectType);
}
