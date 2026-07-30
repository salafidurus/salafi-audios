import { MenuView, type MenuAction, type NativeActionEvent } from "@expo/ui/community/menu";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useQueryClient } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

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
    // Content queries carry the locale via Accept-Language; refetch so cached
    // results are replaced with the newly selected language.
    await queryClient.invalidateQueries();
    await changeLocale(locale);
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
        void handleSelect(event.nativeEvent.event as Locale)
      }
    >
      {/* Plain View, not Pressable: MenuView's tap-to-open needs SwiftUI's Menu to
          own the tap gesture on this trigger. A Pressable — even without onPress —
          claims RN's touch responder and blocks the native tap from ever firing. */}
      <View style={styles.trigger}>
        <Text style={styles.triggerLabel}>{LOCALE_LABELS[activeLocale]}</Text>
        <Text style={styles.chevron}>▾</Text>
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
