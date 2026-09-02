import { z } from "zod";

/** Provides the recursive locale message types and merge validation. */
/** Models nested locale dictionaries whose leaves are translated strings. */
export type LocaleMessageValue = string | LocaleMessages;
/** Recursive dictionary accepted by i18next resource bundles. */
export type LocaleMessages = { [key: string]: LocaleMessageValue };

/** Validates the recursive locale dictionary shape before messages enter i18next. */
export const LocaleMessagesSchema: z.ZodType<LocaleMessages> = z.lazy(() =>
  z.record(z.string(), z.union([z.string(), LocaleMessagesSchema])),
);

function isLocaleMessages(value: LocaleMessageValue): value is LocaleMessages {
  return LocaleMessagesSchema.safeParse(value).success;
}

/** Recursively overlays web translations while retaining untouched shared messages. */
export function mergeLocaleMessages(shared: LocaleMessages, overrides: Partial<LocaleMessages>) {
  const result = { ...shared };

  for (const [key, overrideValue] of Object.entries(overrides)) {
    if (overrideValue === undefined) {
      continue;
    }

    const sharedValue = shared[key];
    if (
      sharedValue !== undefined &&
      isLocaleMessages(sharedValue) &&
      isLocaleMessages(overrideValue)
    ) {
      result[key] = mergeLocaleMessages(sharedValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result;
}
