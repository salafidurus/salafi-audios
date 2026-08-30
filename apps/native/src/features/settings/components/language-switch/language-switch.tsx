import { MenuView, type MenuAction, type NativeActionEvent } from "@expo/ui/community/menu";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { changeLocale } from "@/core/i18n/i18n";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

/** Provides native account, preference, support, and settings workflows. */
const LOCALE_LABELS = {
  en: "English",
  ar: "العربية",
} satisfies Record<Locale, string>;

function parseLocale(locale: string): Locale {
  return locale === "ar" ? "ar" : "en";
}

/** Renders the native language switch surface and coordinates its user-facing state. */
export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const activeLocale = parseLocale(i18n.language);

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

  const actions: MenuAction[] = SUPPORTED_LOCALES.map((locale) => ({
    id: locale,
    title: LOCALE_LABELS[locale],
    state: locale === activeLocale ? "on" : "off",
  }));

  return (
    <MenuView
      testID="language-switch-menu"
      actions={actions}
      onPressAction={(event: NativeActionEvent) =>
        void handleSelect(parseLocale(event.nativeEvent.event))
      }
    >
      {/* Plain View, not Pressable: MenuView's tap-to-open needs SwiftUI's Menu to
          own the tap gesture on this trigger. A Pressable — even without onPress —
          claims RN's touch responder and blocks the native tap from ever firing. */}
      <View style={styles.trigger}>
        <AppText variant="labelMd" style={styles.triggerLabel}>
          {LOCALE_LABELS[activeLocale]}
        </AppText>
        <AppText variant="labelMd" style={styles.chevron}>
          ▾
        </AppText>
      </View>
    </MenuView>
  );
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
    alignSelf: "flex-start",
  },
  triggerLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.content.strong,
  },
  chevron: {
    color: theme.colors.content.strong,
  },
}));
