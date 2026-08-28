import type { MongoAbility } from "@casl/ability";

/**
 * The CASL action/subject vocabulary shared between the backend's ability
 * factory (apps/api) and the frontend's ability hook (packages/domain-account,
 * consumed by apps/web and apps/native). Both sides must agree on these exact
 * string unions for the packed rules shipped via UserProfileDto's `rules`
 * field to reconstruct into an equivalent client-side ability.
 */
/** Defines the contract type for app actions. */
export type AppActions =
  | "manage"
  | "read"
  | "write"
  | "translate"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "upload"
  | "grant";

/** Defines the contract type for app subject type. */
export type AppSubjectType =
  | "Scholar"
  | "Listing"
  | "Translation"
  | "Topic"
  | "Media"
  | "User"
  | "UserAccess";

// Minimal shapes for subjects that are ever checked with resource conditions
// (scholarSlug/locale). Plain data shapes, not real domain classes — CASL only
// needs these to type the `conditions` argument passed alongside a subject().
/** Defines the contract type for scholar subject. */
export type ScholarSubject = { slug: string };
/** Defines the contract type for listing subject. */
export type ListingSubject = { scholarSlug: string };
/** Defines the contract type for translation subject. */
export type TranslationSubject = { scholarSlug?: string; locale: string };
/** Defines the contract type for media subject. */
export type MediaSubject = { scholarSlug: string };

/** Defines the contract type for app subjects. */
export type AppSubjects =
  | "all"
  | AppSubjectType
  | ScholarSubject
  | ListingSubject
  | TranslationSubject
  | MediaSubject;

/** Defines the contract type for app ability. */
export type AppAbility = MongoAbility<[AppActions, AppSubjects]>;
