import { useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { Toggle } from "@/shared/components/Toggle/Toggle";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl";
import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

type ThemePreference = "system" | "parchment" | "manuscript" | "midnight" | "ember";

interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

function getInitialTheme(): ThemePreference {
  return (UnistylesRuntime.themeName as ThemePreference) || "system";
}

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme);
  const [notif, setNotif] = useState<NotificationState>({
    master: true,
    scholars: true,
    lectures: true,
  });

  const handleThemeChange = useCallback((val: ThemePreference) => {
    setThemePreference(val);
    UnistylesRuntime.setTheme(val);
  }, []);

  const handleNotifChange = useCallback(
    (key: keyof NotificationState) => (checked: boolean) => {
      setNotif((prev) => ({ ...prev, [key]: checked }));
    },
    [],
  );

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.general.themeOptions.system", "System") },
    { value: "parchment", label: t("settings.general.themeOptions.parchment", "Parchment") },
    { value: "manuscript", label: t("settings.general.themeOptions.manuscript", "Manuscript") },
    { value: "midnight", label: t("settings.general.themeOptions.midnight", "Midnight") },
    { value: "ember", label: t("settings.general.themeOptions.ember", "Ember") },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Language Section */}
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

      {/* Display Section */}
      <SettingsSection
        title={t("settings.general.displaySection", "Display")}
        description={t("settings.general.displayDesc", "Choose a theme for the interface.")}
      >
        <SettingsRow
          label={t("settings.general.theme", "Theme")}
          sublabel={t("settings.general.themeDesc", "System follows your OS preference")}
          stacked
        >
          <SegmentedControl
            options={themeOptions}
            value={themePreference}
            onChange={handleThemeChange}
            ariaLabel={t("settings.general.themeAria", "Theme preference")}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection
        title={t("settings.general.notifSection", "Notifications")}
        description={t("settings.general.notifDesc", "Manage what notifications you receive.")}
      >
        <SettingsRow
          label={t("settings.general.enableNotif", "Enable Notifications")}
          sublabel={t("settings.general.enableNotifDesc", "Master toggle for all notifications")}
        >
          <Toggle checked={notif.master} onChange={handleNotifChange("master")} />
        </SettingsRow>
        {notif.master && (
          <>
            <SettingsRow
              label={t("settings.general.followedScholars", "Followed Scholars")}
              sublabel={t(
                "settings.general.followedScholarsDesc",
                "Notify when a followed scholar posts",
              )}
            >
              <Toggle checked={notif.scholars} onChange={handleNotifChange("scholars")} />
            </SettingsRow>
            <SettingsRow
              label={t("settings.general.newLectures", "New Lectures")}
              sublabel={t(
                "settings.general.newLecturesDesc",
                "Notify when new lectures are published",
              )}
              hideBorder
            >
              <Toggle checked={notif.lectures} onChange={handleNotifChange("lectures")} />
            </SettingsRow>
          </>
        )}
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
}));
