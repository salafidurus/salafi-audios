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

const THEME_KEY = "theme-preference";
const THEME_CHANGE_EVENT = "theme-change";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

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
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadThemePreference);
  const [notif, setNotif] = useState<NotificationState>(loadNotifState);

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

  return (
    <ScreenView>
      <PageHeader title="Settings" />

      <SettingsSection title="Language" description="Configure app and content language.">
        <SettingsRow label="App Language" sublabel="Interface language for the app">
          <LanguageSwitch />
        </SettingsRow>
        <SettingsRow label="Content Language" sublabel="Preferred translation language">
          <ContentLanguageToggle />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Display" description="Choose a theme for the interface.">
        <SettingsRow label="Theme" sublabel="System follows your OS preference">
          <SegmentedControl
            options={THEME_OPTIONS}
            value={themePreference}
            onChange={handleThemeChange}
            ariaLabel="Theme preference"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Manage what notifications you receive.">
        <SettingsRow label="Enable Notifications" sublabel="Master toggle for all notifications">
          <Toggle
            checked={notif.master}
            onChange={handleNotifChange("master")}
            aria-label="Enable Notifications"
          />
        </SettingsRow>
        {notif.master && (
          <>
            <SettingsRow label="Followed Scholars" sublabel="Notify when a followed scholar posts">
              <Toggle
                checked={notif.scholars}
                onChange={handleNotifChange("scholars")}
                aria-label="Notify for Followed Scholars"
              />
            </SettingsRow>
            <SettingsRow label="New Lectures" sublabel="Notify when new lectures are published">
              <Toggle
                checked={notif.lectures}
                onChange={handleNotifChange("lectures")}
                aria-label="Notify for New Lectures"
              />
            </SettingsRow>
          </>
        )}
      </SettingsSection>
    </ScreenView>
  );
}
