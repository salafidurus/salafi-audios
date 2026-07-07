import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useQueryClient } from "@tanstack/react-query";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { changeLocale } from "@/core/i18n/i18n";
import { useTranslation } from "@/core/i18n/use-translation";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const activeLocale =
    (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : "en";

  const handleSelect = async (locale: Locale) => {
    setOpen(false);
    if (i18n.language === locale) return;
    // Content queries carry the locale via Accept-Language; refetch so cached
    // results are replaced with the newly selected language.
    await queryClient.invalidateQueries();
    await changeLocale(locale);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.trigger} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.triggerLabel}>{LOCALE_LABELS[activeLocale]}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {open ? (
        <View style={styles.menu}>
          {SUPPORTED_LOCALES.map((locale) => {
            const isActive = locale === activeLocale;
            return (
              <Pressable
                key={locale}
                onPress={() => void handleSelect(locale)}
                style={[styles.option, isActive && styles.optionActive]}
              >
                <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                  {LOCALE_LABELS[locale]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "flex-start",
    position: "relative",
  },
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
  },
  triggerLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.content.strong,
  },
  chevron: {
    color: theme.colors.content.strong,
  },
  menu: {
    position: "absolute",
    top: "100%",
    insetInlineStart: 0,
    marginTop: theme.spacing.scale.sm,
    minWidth: "100%",
    paddingVertical: theme.spacing.scale.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
    zIndex: 20,
  },
  option: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
  },
  optionActive: {
    backgroundColor: theme.colors.action.primary,
  },
  optionLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.content.strong,
  },
  optionLabelActive: {
    color: theme.colors.content.onPrimary,
  },
}));
