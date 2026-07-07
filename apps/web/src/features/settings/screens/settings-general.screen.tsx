"use client";

import { useState, useCallback } from "react";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";
import type { ThemePreference } from "@/core/styles/ThemeSync";
import styles from "./settings-general.screen.module.css";

const THEME_KEY = "theme-preference";
const THEME_CHANGE_EVENT = "theme-change";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface NotificationState {
  master: boolean;
  live: boolean;
  scholars: boolean;
  lectures: boolean;
}

const NOTIF_KEY = "notification-settings";

function loadNotifState(): NotificationState {
  if (typeof window === "undefined") {
    return { master: true, live: true, scholars: true, lectures: true };
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw) as NotificationState;
  } catch {
    // ignore parse errors
  }
  return { master: true, live: true, scholars: true, lectures: true };
}

function loadThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
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

  const handleNotifChange = useCallback(
    (key: keyof NotificationState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setNotif((prev) => {
        const next = { ...prev, [key]: e.target.checked };
        localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return (
    <ScreenView>
      <div className={styles.page}>
        <h1 className={styles.title}>Settings</h1>

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
            <label className={styles.toggle}>
              <input
                type="checkbox"
                role="switch"
                aria-checked={notif.master}
                aria-label="Enable Notifications"
                checked={notif.master}
                onChange={handleNotifChange("master")}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack} />
            </label>
          </SettingsRow>
          {notif.master && (
            <>
              <SettingsRow label="Live Sessions" sublabel="Notify when a live session starts">
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={notif.live}
                    aria-label="Notify for Live Sessions"
                    checked={notif.live}
                    onChange={handleNotifChange("live")}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleTrack} />
                </label>
              </SettingsRow>
              <SettingsRow
                label="Followed Scholars"
                sublabel="Notify when a followed scholar posts"
              >
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={notif.scholars}
                    aria-label="Notify for Followed Scholars"
                    checked={notif.scholars}
                    onChange={handleNotifChange("scholars")}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleTrack} />
                </label>
              </SettingsRow>
              <SettingsRow label="New Lectures" sublabel="Notify when new lectures are published">
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={notif.lectures}
                    aria-label="Notify for New Lectures"
                    checked={notif.lectures}
                    onChange={handleNotifChange("lectures")}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleTrack} />
                </label>
              </SettingsRow>
            </>
          )}
        </SettingsSection>
      </div>
    </ScreenView>
  );
}
