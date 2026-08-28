import { z } from "zod";

/** Locale, direction, and original-content field contracts used for localized catalog data. */
/** Ordered locale allowlist used to construct the runtime locale validator. */
/** Defines the runtime contract value for supported locales. */
export const SUPPORTED_LOCALES = ["en", "ar"] as const;

/** Runtime validator for the locales supported by the platform. */
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);

/** Supported locale union inferred from {@link LocaleSchema}. */
export type Locale = z.infer<typeof LocaleSchema>;

/** Fallback locale used when a caller does not provide a preference. */
export const DEFAULT_LOCALE: Locale = "en";

/** Locales whose rendered content follows right-to-left reading direction. */
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

/** Original-language content retained when a localized DTO presents translated fields. */
export type ContentOriginalFields = z.infer<typeof ContentOriginalFieldsSchema>;

/** Original-language values for scholar entities. See {@link ContentOriginalFields}. */
export const ScholarOriginalFieldsSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

/** Original-language scholar fields retained alongside translated presentation fields. */
export type ScholarOriginalFields = z.infer<typeof ScholarOriginalFieldsSchema>;
