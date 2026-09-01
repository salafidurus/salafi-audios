/** Provides locale selection and invalidates localized query data after changes. */
import { Host, Picker } from "@expo/ui";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";

import { changeLocale } from "@/core/i18n/i18n";
import { useTranslation } from "@/core/i18n/use-translation";

/** Owns locale labels and query invalidation after a locale change. */
const LOCALE_LABELS = {
  en: "English",
  ar: "العربية",
} satisfies Record<Locale, string>;

/** Switches locale, clearing stale query data before refetching. */
/** Switches locale after clearing stale data that was fetched under the old locale. */
export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const activeLocale =
    // SAFETY: LOCALE_LABELS is the complete supported locale dictionary.
    /* SAFETY: unknown locale falls back to supported English */ (i18n.language as Locale) in
    LOCALE_LABELS
      ? /* SAFETY: dictionary membership narrows the locale */ (i18n.language as Locale)
      : "en";

  const handleSelect = async (locale: Locale) => {
    if (i18n.language === locale) return;
    // changeLocale() switches live, with no app reload. Clear the query
    // cache first — a refetch before the switch would still use the OLD
    // locale's Accept-Language — then invalidate once the new locale is
    // active so visible screens refetch under the new Accept-Language.
    queryClient.clear();
    await changeLocale(locale);
    await queryClient.invalidateQueries();
  };

  return (
    <Host matchContents>
      <Picker
        testID="language-switch-menu"
        selectedValue={activeLocale}
        // SAFETY: Picker values are populated exclusively from SUPPORTED_LOCALES.
        onValueChange={(locale) =>
          void handleSelect(/* SAFETY: values originate from SUPPORTED_LOCALES */ locale as Locale)
        }
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <Picker.Item key={locale} label={LOCALE_LABELS[locale]} value={locale} />
        ))}
      </Picker>
    </Host>
  );
}
