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

    const allowedCapabilities: Record<AccessTarget, AccessCapability[]> = {
      scholar: ["write", "publish", "delete"],
      listing: ["write", "publish", "delete"],
      media: ["write", "delete"],
      topic: ["write", "publish", "delete"],
      translation: ["translate", "publish", "delete"],
      user: ["manage"],
    };
    if (!allowedCapabilities[grant.target].includes(grant.capability)) {
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
});
export type ReplaceUserAccessRequest = z.infer<typeof ReplaceUserAccessRequestSchema>;
