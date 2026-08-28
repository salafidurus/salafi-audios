import type { AccessCapability, AccessTarget, Locale } from '@sd/core-db';

/** Core API ability.types module providing shared backend infrastructure and authority-boundary services. */
// The action/subject vocabulary is shared with the frontend ability hook
// (packages/domain-account) via @sd/core-contracts — both sides must agree
// on these exact string unions for packed rules to reconstruct correctly.
export type {
  AppActions,
  AppSubjectType,
  ScholarSubject,
  ListingSubject,
  TranslationSubject,
  MediaSubject,
  AppSubjects,
  AppAbility,
} from '@sd/core-contracts';

/** API type describing the access grant attribute contract. */
export type AccessGrantAttribute = {
  target: AccessTarget;
  capability: AccessCapability;
  /** Documents the scholarSlug field's API projection semantics and lifecycle meaning. */
  scholarSlug: string | null;
  locale: Locale | null;
};

/** API type describing the ability input contract. */
export type AbilityInput = {
  /** Documents the roles field's API projection semantics and lifecycle meaning. */
  roles: string[];
  accessGrants?: AccessGrantAttribute[];
};
