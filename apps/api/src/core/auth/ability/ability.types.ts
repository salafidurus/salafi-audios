import type { AccessCapability, AccessTarget, Locale } from '@sd/core-db';

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

export type ScholarLinkAttribute = {
  scholarId: string;
  permissionType: 'OWN_CONTENT' | 'ASSIGNED_EDITOR';
};

export type TranslatorRoleAttribute = {
  scholarId: string | null;
  locale: Locale;
  canPublish: boolean;
};

export type AccessGrantAttribute = {
  target: AccessTarget;
  capability: AccessCapability;
  scholarId: string | null;
  locale: Locale | null;
};

export type AbilityInput = {
  roles: string[];
  permissions: string[];
  scholarLinks: ScholarLinkAttribute[];
  translatorRoles: TranslatorRoleAttribute[];
  accessGrants?: AccessGrantAttribute[];
};
