import type { MongoAbility } from '@casl/ability';

export type AppActions =
  | 'manage'
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'upload'
  | 'grant';

export type AppSubjectType =
  | 'Scholar'
  | 'Listing'
  | 'Translation'
  | 'Topic'
  | 'Media'
  | 'User'
  | 'UserRoleAssignment'
  | 'UserPermission'
  | 'UserScholarRole'
  | 'UserTranslatorRole';

// Minimal shapes for subjects that are ever checked with resource conditions
// (scholarId/locale). Plain data shapes, not real domain classes — CASL only
// needs these to type the `conditions` argument passed alongside a subject().
export type ScholarSubject = { id: string };
export type ListingSubject = { scholarId: string };
export type TranslationSubject = { scholarId?: string; locale: string };
export type MediaSubject = { scholarId: string };

export type AppSubjects =
  | 'all'
  | AppSubjectType
  | ScholarSubject
  | ListingSubject
  | TranslationSubject
  | MediaSubject;

export type AppAbility = MongoAbility<[AppActions, AppSubjects]>;

export type ScholarLinkAttribute = {
  scholarId: string;
  permissionType: 'OWN_CONTENT' | 'ASSIGNED_EDITOR';
};

export type TranslatorRoleAttribute = {
  scholarId: string | null;
  locale: string;
  canPublish: boolean;
};

export type AbilityInput = {
  roles: string[];
  permissions: string[];
  scholarLinks: ScholarLinkAttribute[];
  translatorRoles: TranslatorRoleAttribute[];
};
