import type { MongoAbility } from "@casl/ability";

/**
 * The CASL action/subject vocabulary shared between the backend's ability
 * factory (apps/api) and the frontend's ability hook (packages/domain-account,
 * consumed by apps/web and apps/native). Both sides must agree on these exact
 * string unions for the packed rules shipped via UserProfileDto's `rules`
 * field to reconstruct into an equivalent client-side ability.
 */
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
export type ScholarSubject = { slug: string };
export type ListingSubject = { scholarSlug: string };
export type TranslationSubject = { scholarSlug?: string; locale: string };
export type MediaSubject = { scholarSlug: string };

export type AppSubjects =
  | "all"
  | AppSubjectType
  | ScholarSubject
  | ListingSubject
  | TranslationSubject
  | MediaSubject;

export type AppAbility = MongoAbility<[AppActions, AppSubjects]>;
