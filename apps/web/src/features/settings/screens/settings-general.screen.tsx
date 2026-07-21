"use client";

import { useState, useCallback, useEffect } from "react";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";
import { Toggle } from "@/shared/components/Toggle";
import type { ThemePreference } from "@/core/styles/ThemeSync";
import { THEME_KEY, THEME_CHANGE_EVENT } from "@/core/styles/ThemeSync";
import { useTranslation } from "@/core/i18n/use-translation";

interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

const NOTIF_KEY = "notification-settings:v1";

function loadNotifState(): NotificationState {
  if (typeof window === "undefined") {
    return { master: true, scholars: true, lectures: true };
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) {
      return JSON.parse(raw) as NotificationState;
    }
  } catch {
    // ignore parse errors
  }
  return { master: true, scholars: true, lectures: true };
}

function loadThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "system";
}

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadThemePreference);
  const [notif, setNotif] = useState<NotificationState>(loadNotifState);

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.general.themeOptions.system", "System") },
    { value: "light", label: t("settings.general.themeOptions.light", "Light") },
    { value: "dark", label: t("settings.general.themeOptions.dark", "Dark") },
  ];

  const handleThemeChange = useCallback((value: ThemePreference) => {
    setThemePreference(value);
    localStorage.setItem(THEME_KEY, value);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notif));
  }, [notif]);

  const handleNotifChange = useCallback(
    (key: keyof NotificationState) => (checked: boolean) => {
      setNotif((prev) => ({ ...prev, [key]: checked }));
    },
    [],
  );

  // Persist notification state to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notif));
  }, [notif]);

  return (
    <ScreenView>
      <PageHeader title={t("settings.general.title", "Settings")} />

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
        <SettingsRow
          label={t("settings.general.contentLanguage", "Content Language")}
          sublabel={t("settings.general.contentLanguageDesc", "Preferred translation language")}
        >
          <ContentLanguageToggle />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title={t("settings.general.displaySection", "Display")}
        description={t("settings.general.displayDesc", "Choose a theme for the interface.")}
      >
        <SettingsRow
          label={t("settings.general.theme", "Theme")}
          sublabel={t("settings.general.themeDesc", "System follows your OS preference")}
        >
          <SegmentedControl
            options={themeOptions}
            value={themePreference}
            onChange={handleThemeChange}
            ariaLabel={t("settings.general.themeAria", "Theme preference")}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title={t("settings.general.notifSection", "Notifications")}
        description={t("settings.general.notifDesc", "Manage what notifications you receive.")}
      >
        <SettingsRow
          label={t("settings.general.enableNotif", "Enable Notifications")}
          sublabel={t("settings.general.enableNotifDesc", "Master toggle for all notifications")}
        >
          <Toggle
            checked={notif.master}
            onChange={handleNotifChange("master")}
            aria-label={t("settings.general.enableNotif", "Enable Notifications")}
          />
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
              <Toggle
                checked={notif.scholars}
                onChange={handleNotifChange("scholars")}
                aria-label={t("settings.general.followedScholars", "Notify for Followed Scholars")}
              />
            </SettingsRow>
            <SettingsRow
              label={t("settings.general.newLectures", "New Lectures")}
              sublabel={t(
                "settings.general.newLecturesDesc",
                "Notify when new lectures are published",
              )}
            >
              <Toggle
                checked={notif.lectures}
                onChange={handleNotifChange("lectures")}
                aria-label={t("settings.general.newLectures", "Notify for New Lectures")}
              />
            </SettingsRow>
          </>
        )}
      </SettingsSection>
    </ScreenView>
  );
}
