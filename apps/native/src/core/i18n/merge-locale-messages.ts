/** Provides the native core i18n merge-locale-messages module responsibility. */
/** Describes the LocaleMessageValue native type contract and behavior. */
export type LocaleMessageValue = string | LocaleMessages;
/** Describes the LocaleMessages native type contract and behavior. */
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

/** Describes the mergeLocaleMessages native function contract and behavior. */
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
