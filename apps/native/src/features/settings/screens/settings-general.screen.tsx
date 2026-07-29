import { routes } from "@sd/core-contracts";
import { type Href, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SettingsSection title={t("account.profile", "Account")}>
        <SettingsRow
          label={t("settings.profile", "Profile")}
          sublabel={t("settings.profileDesc", "View and manage your account")}
          onPress={() => router.push(routes.settings.profile as Href)}
          hideBorder
        />
      </SettingsSection>

      <SettingsSection
        title={t("settings.general.languageSection", "Language")}
        description={t("settings.general.languageDesc", "Configure app and content language.")}
      >
        <SettingsRow
          label={t("settings.general.appLanguage", "App Language")}
          sublabel={t("settings.general.appLanguageDesc", "Interface language for the app")}
        >
          <LanguageSwitch />
        </SettingsRow>
        <SettingsRow fullWidth hideBorder>
          <ContentLanguageToggle />
        </SettingsRow>
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
}));
