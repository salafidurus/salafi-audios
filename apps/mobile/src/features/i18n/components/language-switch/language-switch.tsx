import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { changeLocale } from "../../../../core/i18n/i18n";
import { useTranslation } from "../../../../core/i18n/use-translation";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <View style={styles.container}>
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = i18n.language === locale;

        return (
          <Pressable
            key={locale}
            onPress={() => void changeLocale(locale)}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
              {LOCALE_LABELS[locale]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    gap: theme.spacing.component.gapSm,
  },
  button: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
  },
  buttonActive: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.action.primary,
  },
  buttonLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.content.strong,
  },
  buttonLabelActive: {
    color: theme.colors.content.onPrimary,
  },
}));
