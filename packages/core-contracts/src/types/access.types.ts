import { z } from "zod";

import { LocaleSchema } from "./localization.types";

export const AccessTargetEnum = z.enum([
  "scholar",
  "listing",
  "media",
  "topic",
  "translation",
  "user",
]);
export type AccessTarget = z.infer<typeof AccessTargetEnum>;

export const AccessCapabilityEnum = z.enum(["write", "translate", "publish", "delete", "manage"]);
export type AccessCapability = z.infer<typeof AccessCapabilityEnum>;

function canGrantCapability(target: AccessTarget, capability: AccessCapability): boolean {
  switch (target) {
    case "scholar":
    case "listing":
    case "topic":
      return capability === "write" || capability === "publish" || capability === "delete";
    case "media":
      return capability === "write" || capability === "delete";
    case "translation":
      return capability === "translate" || capability === "publish" || capability === "delete";
    case "user":
      return capability === "manage";
  }
}

export const AccessGrantRequestSchema = z
  .object({
    target: AccessTargetEnum,
    capability: AccessCapabilityEnum,
    scholarSlugs: z.array(z.string()).default([]),
    locales: z.array(LocaleSchema).default([]),
  })
  .superRefine((grant, ctx) => {
    const scholarScopedTargets = ["scholar", "listing", "media", "translation"];
    if (!scholarScopedTargets.includes(grant.target) && grant.scholarSlugs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scholarSlugs"],
        message: "This target cannot be scholar-scoped",
      });
    }

    if (!canGrantCapability(grant.target, grant.capability)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capability"],
        message: "This capability cannot be granted for this target",
      });
    }

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
  });
export type AccessGrantRequest = z.infer<typeof AccessGrantRequestSchema>;

export const UserAccessSnapshotSchema = z.object({
  userId: z.string(),
  version: z.number().int().nonnegative(),
  grants: z.array(AccessGrantRequestSchema),
  roles: z.array(z.string()),
  isSuperadmin: z.boolean(),
  scholars: z.array(z.object({ slug: z.string(), name: z.string() })),
});
export type UserAccessSnapshot = z.infer<typeof UserAccessSnapshotSchema>;

export const ReplaceUserAccessRequestSchema = z.object({
  version: z.number().int().nonnegative(),
  grants: z.array(AccessGrantRequestSchema),
  isSuperadmin: z.boolean().optional(),
});
export type ReplaceUserAccessRequest = z.infer<typeof ReplaceUserAccessRequestSchema>;
