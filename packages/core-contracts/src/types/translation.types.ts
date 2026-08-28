import { z } from "zod";

import { LocaleSchema } from "./localization.types";

/** Translation status, localized content, and locale-update contracts for catalog entities. */
/** Editorial state of a localized translation. */
export const TranslationStatusSchema = z.enum(["draft", "published"]);
/** Translation editorial-state union inferred from {@link TranslationStatusSchema}. */
export type TranslationStatus = z.infer<typeof TranslationStatusSchema>;

/** Localized fields and editorial metadata returned for one translation. */
export const TranslationViewDtoSchema = z.object({
  locale: LocaleSchema,
  status: TranslationStatusSchema.optional(),
  fields: z.record(z.string(), z.string().nullable()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
/** Validated translation response. */
export type TranslationViewDto = z.infer<typeof TranslationViewDtoSchema>;

/** Localized fields submitted when creating or replacing a translation. */
export const SaveTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  fields: z.record(z.string(), z.string().nullable()),
});
/** Validated translation write request. */
export type SaveTranslationDto = z.infer<typeof SaveTranslationDtoSchema>;

/** Identifies the catalog entity whose translation is being addressed. */
export const TranslationTargetSchema = z.union([
  z.object({ entity: z.literal("scholar"), scholarId: z.string() }),
  z.object({ entity: z.literal("listing"), listingId: z.string() }),
  z.object({ entity: z.literal("topic"), topicId: z.string() }),
]);
/** Supported translation target identity union. */
export type TranslationTarget = z.infer<typeof TranslationTargetSchema>;

/** User preference update selecting the locale used for localized responses. */
export const UpdateLocaleDtoSchema = z.object({
  preferredLanguage: LocaleSchema,
});
/** Validated preferred-locale update request. */
export type UpdateLocaleDto = z.infer<typeof UpdateLocaleDtoSchema>;
