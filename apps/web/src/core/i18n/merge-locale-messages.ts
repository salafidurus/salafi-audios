import { z } from "zod";

/** Documents this module's responsibility and public boundary. */
export type LocaleMessageValue = string | LocaleMessages;
export type LocaleMessages = { [key: string]: LocaleMessageValue };

export const LocaleMessagesSchema: z.ZodType<LocaleMessages> = z.lazy(() =>
  z.record(z.string(), z.union([z.string(), LocaleMessagesSchema])),
);

function isLocaleMessages(value: LocaleMessageValue): value is LocaleMessages {
  return LocaleMessagesSchema.safeParse(value).success;
}

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
