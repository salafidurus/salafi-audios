import { AsyncLocalStorage } from 'node:async_hooks';
import { DEFAULT_LOCALE } from '@sd/core-i18n';
import type { Locale } from '@sd/core-contracts';

type LocaleHolder = { locale: Locale };

const storage = new AsyncLocalStorage<LocaleHolder>();

/**
 * Runs `fn` (and everything it awaits) inside a locale scope. Read the locale
 * anywhere downstream with {@link getRequestLocale} — no need to thread it
 * through service/repository signatures.
 */
export function runWithLocale<T>(locale: Locale, fn: () => T): T {
  return storage.run({ locale }, fn);
}

/** Refines the locale for the current scope once more context is known (e.g.
 * the authenticated user's `preferredLanguage`). No-op outside a scope. */
export function setRequestLocale(locale: Locale): void {
  const holder = storage.getStore();
  if (holder) holder.locale = locale;
}

/** The locale for the in-flight request, falling back to the default locale
 * when called outside a request scope (e.g. unit tests, jobs). */
export function getRequestLocale(): Locale {
  return storage.getStore()?.locale ?? DEFAULT_LOCALE;
}
