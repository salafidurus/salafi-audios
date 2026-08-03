import { Column, Row, ScrollView, Switch } from "@expo/ui";
import { useCallback, useState } from "react";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeScreenHost, NativeSegmentedControl, NativeText } from "@/shared/ui";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";

type ThemePreference = "system" | "light" | "dark";

interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

function getInitialTheme(): ThemePreference {
  if (UnistylesRuntime.hasAdaptiveThemes) {
    return "system";
  }
  return UnistylesRuntime.themeName === "dark" ? "dark" : "light";
}

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme);
  const [notif, setNotif] = useState<NotificationState>({
    master: true,
    scholars: true,
    lectures: true,
  });

  const handleThemeChange = useCallback((val: ThemePreference) => {
    setThemePreference(val);
    if (val === "system") {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(val);
    }
  }, []);

  const handleNotifChange = useCallback(
    (key: keyof NotificationState) => (checked: boolean) => {
      setNotif((prev) => ({ ...prev, [key]: checked }));
    },
    [],
  );

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.general.themeOptions.system", "System") },
    { value: "light", label: t("settings.general.themeOptions.light", "Light") },
    { value: "dark", label: t("settings.general.themeOptions.dark", "Dark") },
  ];

  return (
    <NativeScreenHost testID="settings-general-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.layout.sectionY}
          style={{ padding: theme.spacing.layout.pageX }}
        >
          <Column spacing={theme.spacing.component.gapMd}>
            <NativeText variant="titleMd" colorRole="strong">
              {t("settings.general.languageSection", "Language")}
            </NativeText>
            <Row alignment="center" spacing={theme.spacing.component.gapMd}>
              <Column spacing={theme.spacing.scale.xs}>
                <NativeText variant="bodyMd" colorRole="strong">
                  {t("settings.general.appLanguage", "App Language")}
                </NativeText>
                <NativeText variant="bodySm" colorRole="muted">
                  {t("settings.general.appLanguageDesc", "Interface language for the app")}
                </NativeText>
              </Column>
              <LanguageSwitch />
            </Row>
            <ContentLanguageToggle />
          </Column>
          <Column spacing={theme.spacing.component.gapMd}>
            <NativeText variant="titleMd" colorRole="strong">
              {t("settings.general.displaySection", "Display")}
            </NativeText>
            <NativeText variant="bodySm" colorRole="muted">
              {t("settings.general.displayDesc", "Choose a theme for the interface.")}
            </NativeText>
            <NativeSegmentedControl
              values={themeOptions.map((option) => option.label)}
              value={
                themeOptions.find((option) => option.value === themePreference)?.label ??
                themeOptions[0]!.label
              }
              onValueChange={(label) =>
                handleThemeChange(
                  themeOptions.find((option) => option.label === label)?.value ?? "system",
                )
              }
              testID="settings-theme-control"
            />
          </Column>
          <Column spacing={theme.spacing.component.gapMd}>
            <NativeText variant="titleMd" colorRole="strong">
              {t("settings.general.notifSection", "Notifications")}
            </NativeText>
            <PreferenceSwitch
              label={t("settings.general.enableNotif", "Enable Notifications")}
              detail={t("settings.general.enableNotifDesc", "Master toggle for all notifications")}
              value={notif.master}
              onValueChange={handleNotifChange("master")}
            />
            {notif.master ? (
              <>
                <PreferenceSwitch
                  label={t("settings.general.followedScholars", "Followed Scholars")}
                  detail={t(
                    "settings.general.followedScholarsDesc",
                    "Notify when a followed scholar posts",
                  )}
                  value={notif.scholars}
                  onValueChange={handleNotifChange("scholars")}
                />
                <PreferenceSwitch
                  label={t("settings.general.newLectures", "New Lectures")}
                  detail={t(
                    "settings.general.newLecturesDesc",
                    "Notify when new lectures are published",
                  )}
                  value={notif.lectures}
                  onValueChange={handleNotifChange("lectures")}
                />
              </>
            ) : null}
          </Column>
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}

function PreferenceSwitch({
  label,
  detail,
  value,
  onValueChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { theme } = useUnistyles();
  return (
    <Row alignment="center" spacing={theme.spacing.component.gapMd}>
      <Column spacing={theme.spacing.scale.xs}>
        <NativeText variant="bodyMd" colorRole="strong">
          {label}
        </NativeText>
        <NativeText variant="bodySm" colorRole="muted">
          {detail}
        </NativeText>
      </Column>
      <Switch value={value} onValueChange={onValueChange} />
    </Row>
  );
}
