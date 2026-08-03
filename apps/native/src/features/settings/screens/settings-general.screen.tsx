import { Column, Picker, Row, ScrollView, Switch } from "@expo/ui";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useCallback, useState } from "react";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeScreenHost, NativeText } from "@/shared/ui";

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
  // Compose layouts wrap their children by default. Explicitly filling the
  // available width keeps settings rows aligned on Android without sending a
  // Compose-only modifier to SwiftUI.
  const fullWidthModifiers = process.env.EXPO_OS === "android" ? [fillMaxWidth()] : [];
  const flexibleTextModifiers = process.env.EXPO_OS === "android" ? [weight(1)] : [];

  return (
    <NativeScreenHost testID="settings-general-host">
      <ScrollView modifiers={fullWidthModifiers} showsIndicators={false}>
        <Column
          modifiers={fullWidthModifiers}
          spacing={theme.spacing.layout.sectionY}
          style={{ padding: theme.spacing.layout.pageX }}
        >
          <SettingsSection
            title={t("settings.general.languageSection", "Language")}
            modifiers={fullWidthModifiers}
            theme={theme}
          >
            <Column modifiers={fullWidthModifiers} spacing={theme.spacing.component.gapSm}>
              <Column spacing={theme.spacing.scale.xs}>
                <NativeText variant="bodyMd" colorRole="strong">
                  {t("settings.general.appLanguage", "App Language")}
                </NativeText>
                <NativeText variant="bodySm" colorRole="muted">
                  {t("settings.general.appLanguageDesc", "Interface language for the app")}
                </NativeText>
              </Column>
              <LanguageSwitch />
            </Column>
            <ContentLanguageToggle />
          </SettingsSection>
          <SettingsSection
            title={t("settings.general.displaySection", "Display")}
            modifiers={fullWidthModifiers}
            theme={theme}
          >
            <NativeText variant="bodySm" colorRole="muted">
              {t("settings.general.displayDesc", "Choose a theme for the interface.")}
            </NativeText>
            <Picker
              selectedValue={themePreference}
              onValueChange={(value) => handleThemeChange(value as ThemePreference)}
              testID="settings-theme-control"
            >
              {themeOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </SettingsSection>
          <SettingsSection
            title={t("settings.general.notifSection", "Notifications")}
            modifiers={fullWidthModifiers}
            theme={theme}
          >
            <PreferenceSwitch
              label={t("settings.general.enableNotif", "Enable Notifications")}
              detail={t("settings.general.enableNotifDesc", "Master toggle for all notifications")}
              value={notif.master}
              onValueChange={handleNotifChange("master")}
              flexibleTextModifiers={flexibleTextModifiers}
              fullWidthModifiers={fullWidthModifiers}
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
                  flexibleTextModifiers={flexibleTextModifiers}
                  fullWidthModifiers={fullWidthModifiers}
                />
                <PreferenceSwitch
                  label={t("settings.general.newLectures", "New Lectures")}
                  detail={t(
                    "settings.general.newLecturesDesc",
                    "Notify when new lectures are published",
                  )}
                  value={notif.lectures}
                  onValueChange={handleNotifChange("lectures")}
                  flexibleTextModifiers={flexibleTextModifiers}
                  fullWidthModifiers={fullWidthModifiers}
                />
              </>
            ) : null}
          </SettingsSection>
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
  flexibleTextModifiers,
  fullWidthModifiers,
}: {
  label: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  flexibleTextModifiers: ReturnType<typeof weight>[];
  fullWidthModifiers: ReturnType<typeof fillMaxWidth>[];
}) {
  const { theme } = useUnistyles();
  return (
    <Row alignment="center" modifiers={fullWidthModifiers} spacing={theme.spacing.component.gapMd}>
      <Column modifiers={flexibleTextModifiers} spacing={theme.spacing.scale.xs}>
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

function SettingsSection({
  title,
  children,
  modifiers,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  modifiers: ReturnType<typeof fillMaxWidth>[];
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  return (
    <Column modifiers={modifiers} spacing={theme.spacing.component.gapSm}>
      <NativeText variant="titleMd" colorRole="strong">
        {title}
      </NativeText>
      <Column
        modifiers={modifiers}
        spacing={theme.spacing.component.gapMd}
        style={{
          backgroundColor: theme.colors.surface.default,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radius.component.card,
          borderWidth: 1,
          padding: theme.spacing.component.cardPadding,
        }}
      >
        {children}
      </Column>
    </Column>
  );
}
