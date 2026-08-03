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
  });
export type AccessGrantRequest = z.infer<typeof AccessGrantRequestSchema>;
