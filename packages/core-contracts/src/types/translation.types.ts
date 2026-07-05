import { z } from "zod";
import { LocaleSchema } from "./localization.types";

export const TranslationStatusSchema = z.enum(["draft", "published"]);
export type TranslationStatus = z.infer<typeof TranslationStatusSchema>;

export const TranslationViewDtoSchema = z.object({
  locale: LocaleSchema,
  status: TranslationStatusSchema,
  fields: z.record(z.string(), z.string().nullable()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TranslationViewDto = z.infer<typeof TranslationViewDtoSchema>;

export const SaveTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  fields: z.record(z.string(), z.string().nullable()),
});
export type SaveTranslationDto = z.infer<typeof SaveTranslationDtoSchema>;

export const TranslationTargetSchema = z.union([
  z.object({ entity: z.literal("scholar"), scholarId: z.string() }),
  z.object({ entity: z.literal("listing"), listingId: z.string() }),
  z.object({ entity: z.literal("topic"), topicId: z.string() }),
]);
export type TranslationTarget = z.infer<typeof TranslationTargetSchema>;

export const UpdateLocaleDtoSchema = z.object({
  preferredLanguage: LocaleSchema,
});
export type UpdateLocaleDto = z.infer<typeof UpdateLocaleDtoSchema>;
