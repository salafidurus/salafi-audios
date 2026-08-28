/** Initializes native localization, locale persistence, and translated message lookup. */
/** Defines the native locale message value contract shared by its consumers. */
export type LocaleMessageValue = string | LocaleMessages;
/** Defines the native locale messages contract shared by its consumers. */
export type LocaleMessages = { [key: string]: LocaleMessageValue };

function isLocaleMessages(
  value: LocaleMessageValue | Partial<LocaleMessages> | undefined,
): value is LocaleMessages {
  return (
    value !== undefined &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

/** Transforms locale messages into the shape expected by native consumers. */
export function mergeLocaleMessages<T extends LocaleMessages>(shared: T, overrides: Partial<T>): T;
export function mergeLocaleMessages(shared: LocaleMessages, overrides: Partial<LocaleMessages>) {
  const result = { ...shared };

  for (const key of Object.keys(overrides)) {
    const base = shared[key];
    const override = overrides[key];

    if (isLocaleMessages(base) && isLocaleMessages(override)) {
      result[key] = mergeLocaleMessages(base, override);
    } else if (override !== undefined) {
      result[key] = override;
    }
  }

  return result;
}
