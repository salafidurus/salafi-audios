import { z } from "zod";

import { LocaleSchema } from "./localization.types";

/** Schemas for scoped capabilities, access grants, and backend-provided access snapshots. */
/** Defines the runtime contract value for access target enum. */
export const AccessTargetEnum = z.enum([
  "scholar",
  "listing",
  "media",
  "topic",
  "translation",
  "user",
]);
/** Defines the contract type for access target. */
export type AccessTarget = z.infer<typeof AccessTargetEnum>;

/** Defines the runtime contract value for access capability enum. */
export const AccessCapabilityEnum = z.enum(["write", "translate", "publish", "delete", "manage"]);
/** Defines the contract type for access capability. */
export type AccessCapability = z.infer<typeof AccessCapabilityEnum>;

function canGrantCapability(target: AccessTarget, capability: AccessCapability): boolean {
  return capabilityValidators[target](capability);
}

/** Defines the runtime contract value for capability validators. */
const capabilityValidators = {
  scholar: canEditCatalog,
  listing: canEditCatalog,
  topic: canEditCatalog,
  media: canEditMedia,
  translation: canEditTranslation,
  user: (capability) => capability === "manage",
} satisfies Record<AccessTarget, (capability: AccessCapability) => boolean>;

function canEditCatalog(capability: AccessCapability): boolean {
  return capability === "write" || capability === "publish" || capability === "delete";
}

function canEditMedia(capability: AccessCapability): boolean {
  return capability === "write" || capability === "delete";
}

function canEditTranslation(capability: AccessCapability): boolean {
  return capability === "translate" || capability === "publish" || capability === "delete";
}

/** Defines the runtime contract value for access grant request schema. */
export const AccessGrantRequestSchema = z
  .object({
    target: AccessTargetEnum,
    capability: AccessCapabilityEnum,
    scholarSlugs: z.array(z.string()).default([]),
    locales: z.array(LocaleSchema).default([]),
  })
  .superRefine(validateAccessGrant);
/** Defines the contract type for access grant request. */
export type AccessGrantRequest = z.infer<typeof AccessGrantRequestSchema>;

function validateAccessGrant(grant: AccessGrantRequest, ctx: z.RefinementCtx): void {
  validateScholarScope(grant, ctx);
  validateCapability(grant, ctx);
  validateLocaleScope(grant, ctx);
}

function validateScholarScope(grant: AccessGrantRequest, ctx: z.RefinementCtx): void {
  const scholarScopedTargets = ["scholar", "listing", "media", "translation"];
  if (!scholarScopedTargets.includes(grant.target) && grant.scholarSlugs.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scholarSlugs"],
      message: "This target cannot be scholar-scoped",
    });
  }
}

function validateCapability(grant: AccessGrantRequest, ctx: z.RefinementCtx): void {
  if (!canGrantCapability(grant.target, grant.capability)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["capability"],
      message: "This capability cannot be granted for this target",
    });
  }
}

function validateLocaleScope(grant: AccessGrantRequest, ctx: z.RefinementCtx): void {
  if (grant.target === "translation" && grant.locales.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["locales"],
      message: "Translation grants require at least one locale",
    });
  }
  if (grant.target !== "translation" && grant.locales.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["locales"],
      message: "Locale scope is only valid for translation grants",
    });
  }
}

/** Defines the runtime contract value for user access snapshot schema. */
export const UserAccessSnapshotSchema = z.object({
  userId: z.string(),
  version: z.number().int().nonnegative(),
  grants: z.array(AccessGrantRequestSchema),
  roles: z.array(z.string()),
  isSuperadmin: z.boolean(),
  scholars: z.array(z.object({ slug: z.string(), name: z.string() })),
});
/** Defines the contract type for user access snapshot. */
export type UserAccessSnapshot = z.infer<typeof UserAccessSnapshotSchema>;

/** Defines the runtime contract value for replace user access request schema. */
export const ReplaceUserAccessRequestSchema = z.object({
  version: z.number().int().nonnegative(),
  grants: z.array(AccessGrantRequestSchema),
  isSuperadmin: z.boolean().optional(),
});
/** Defines the contract type for replace user access request. */
export type ReplaceUserAccessRequest = z.infer<typeof ReplaceUserAccessRequestSchema>;
