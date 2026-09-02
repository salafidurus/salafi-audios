import { useCallback, useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { RootScreenHeader } from "@/features/navigation";
import { NativeBridgeHost } from "@/shared/ui";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl";
import {
  SettingsAccountActions,
  SettingsSupportLegalActions,
  type SettingsAccountActionsProps,
} from "./settings-account-actions.screen";

/** Renders the general settings form with RN layout and isolated Expo UI controls. */
type ThemePreference = "system" | "light" | "dark";
interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

function getInitialTheme(): ThemePreference {
  if (UnistylesRuntime.hasAdaptiveThemes) return "system";
  return UnistylesRuntime.themeName === "dark" ? "dark" : "light";
}

/** Owns theme, language, and notification preferences for the Settings tab. */
export function SettingsGeneralScreen(props: SettingsAccountActionsProps = {}) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme);
  const [notif, setNotif] = useState<NotificationState>({
    master: true,
    scholars: true,
    lectures: true,
  });

  const handleThemeChange = useCallback((value: ThemePreference) => {
    setThemePreference(value);
    if (value === "system") {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(value);
    }
  }, []);
  const handleNotifChange = useCallback(
    (key: keyof NotificationState) => (checked: boolean) =>
      setNotif((prev) => ({ ...prev, [key]: checked })),
    [],
  );
  const options = [
    { value: "system" as const, label: t("settings.general.themeOptions.system", "System") },
    { value: "light" as const, label: t("settings.general.themeOptions.light", "Light") },
    { value: "dark" as const, label: t("settings.general.themeOptions.dark", "Dark") },
  ];

  return (
    <View style={{ flex: 1 }}>
      <NativeBridgeHost testID="settings-general-host" matchContents={false}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingTop: insets.top,
              paddingHorizontal: theme.spacing.layout.pageX,
            }}
          >
            <RootScreenHeader title={t("navigation.settings", "Settings")} />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: theme.spacing.layout.pageX,
              paddingBottom: theme.spacing.layout.pageY + insets.bottom + 96,
              gap: theme.spacing.layout.sectionY,
            }}
          >
            <SettingsAccountActions {...props} />
            <SettingsSection
              title={t("settings.general.languageSection", "Language")}
              theme={theme}
            >
              <View style={{ gap: theme.spacing.component.gapSm }}>
                <View style={{ gap: theme.spacing.scale.xs }}>
                  <Text
                    style={{ fontSize: 16, lineHeight: 24, color: theme.colors.content.strong }}
                  >
                    {t("settings.general.appLanguage", "App Language")}
                  </Text>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: theme.colors.content.muted }}>
                    {t("settings.general.appLanguageDesc", "Interface language for the app")}
                  </Text>
                </View>
                <LanguageSwitch />
              </View>
              <ContentLanguageToggle />
            </SettingsSection>
            <SettingsSection title={t("settings.general.displaySection", "Display")} theme={theme}>
              <Text style={{ fontSize: 14, lineHeight: 20, color: theme.colors.content.muted }}>
                {t("settings.general.displayDesc", "Choose a theme for the interface.")}
              </Text>
              <SegmentedControl
                options={options}
                value={themePreference}
                onChange={handleThemeChange}
                ariaLabel={t("settings.general.themeAria", "Theme preference")}
              />
            </SettingsSection>
            <SettingsSection
              title={t("settings.general.notifSection", "Notifications")}
              theme={theme}
            >
              <PreferenceSwitch
                label={t("settings.general.enableNotif", "Enable Notifications")}
                detail={t(
                  "settings.general.enableNotifDesc",
                  "Master toggle for all notifications",
                )}
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
            </SettingsSection>
            <SettingsSupportLegalActions {...props} />
          </ScrollView>
        </View>
      </NativeBridgeHost>
    </View>
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
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.component.gapMd }}
    >
      <View style={{ flex: 1, gap: theme.spacing.scale.xs }}>
        <Text style={{ fontSize: 16, lineHeight: 24, color: theme.colors.content.strong }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, color: theme.colors.content.muted }}>
          {detail}
        </Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function SettingsSection({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  return (
    <View style={{ gap: theme.spacing.component.gapSm }}>
      <Text
        style={{
          fontSize: 18,
          lineHeight: 24,
          fontWeight: "600",
          color: theme.colors.content.strong,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          width: "100%",
          gap: theme.spacing.component.gapMd,
          backgroundColor: theme.colors.surface.default,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radius.component.card,
          borderWidth: 1,
          padding: theme.spacing.component.cardPadding,
        }}
      >
        {children}
      </View>
    </View>
  );
}
