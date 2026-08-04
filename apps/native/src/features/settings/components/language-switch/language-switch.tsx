import { Picker } from "@expo/ui";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";

import { changeLocale } from "@/core/i18n/i18n";
import { useTranslation } from "@/core/i18n/use-translation";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const activeLocale =
    (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : "en";

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
    <Picker
      testID="language-switch-menu"
      selectedValue={activeLocale}
      onValueChange={(locale) => void handleSelect(locale as Locale)}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <Picker.Item key={locale} label={LOCALE_LABELS[locale]} value={locale} />
      ))}
    </Picker>
  );
}
