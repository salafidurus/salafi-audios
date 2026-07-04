import { z } from "zod";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;
export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: readonly Locale[] = ["ar"];

/**
 * Original-language values for translatable content entities (lectures, series,
 * collections). Present on a read DTO only when the primary fields have been
 * resolved to a *translation* — so the client can flip to the original language
 * without an extra request. When absent, the primary fields already are the
 * original.
 */
export const ContentOriginalFieldsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});
export type ContentOriginalFields = z.infer<typeof ContentOriginalFieldsSchema>;

/** Original-language values for scholar entities. See {@link ContentOriginalFields}. */
export const ScholarOriginalFieldsSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});
export type ScholarOriginalFields = z.infer<typeof ScholarOriginalFieldsSchema>;
