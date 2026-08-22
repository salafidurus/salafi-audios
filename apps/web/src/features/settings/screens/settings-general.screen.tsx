"use client";

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";

import type { ThemePreference } from "@/core/styles/ThemeSync";
import type { AccentThemePickerValue } from "@/features/settings/components/accent-theme-picker/AccentThemePicker";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  getDefaultAccentTheme,
  isAccentThemeId,
  setAccentThemePreference,
} from "@/core/styles/theme/accent-theme";
import { THEME_KEY, THEME_CHANGE_EVENT } from "@/core/styles/ThemeSync";
import { DownloadAppCard } from "@/features/home/components/download-app-card/download-app-card";
import { AccentThemePicker } from "@/features/settings/components/accent-theme-picker/AccentThemePicker";
import { SegmentedControl } from "@/features/settings/components/SegmentedControl/SegmentedControl";
import { SettingsRow } from "@/features/settings/components/SettingsRow/SettingsRow";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Switch as Toggle } from "@/shared/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { hasWindow } from "@/shared/lib/runtime-guards";

import styles from "./settings-general.screen.module.css";
import { SettingsProfileScreen } from "./settings-profile.screen";

interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

const NOTIF_KEY = "notification-settings:v1";
const NotificationStateSchema = z.object({
  master: z.boolean(),
  scholars: z.boolean(),
  lectures: z.boolean(),
});

function loadNotifState(): NotificationState {
  if (!hasWindow()) {
    return { master: true, scholars: true, lectures: true };
  }
  try {
    const raw = window.localStorage.getItem(NOTIF_KEY);
    if (raw) {
      return NotificationStateSchema.parse(JSON.parse(raw));
    }
  } catch {
    // ignore parse errors
  }
  return { master: true, scholars: true, lectures: true };
}

function loadThemePreference(): ThemePreference {
  if (!hasWindow()) {
    return "system";
  }
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "system";
}

function loadAccentThemePreference(): AccentThemePickerValue {
  if (!hasWindow()) {
    return "system";
  }

  const stored = window.localStorage.getItem("accent-theme:v1");
  if (stored && isAccentThemeId(stored)) {
    return stored;
  }

  return "system";
}

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"general" | "profile">("general");
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadThemePreference);
  const [accentTheme, setAccentTheme] = useState<AccentThemePickerValue>(loadAccentThemePreference);
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

  const handleAccentThemeChange = useCallback((value: AccentThemePickerValue) => {
    setAccentTheme(value);
    if (value === "system") {
      window.localStorage.removeItem("accent-theme:v1");
      void getDefaultAccentTheme();
      window.dispatchEvent(new Event("accent-theme-change"));
    } else {
      setAccentThemePreference(value);
    }
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
      <h1 className={styles.settingsTitle}>{t("settings.general.title", "Settings")}</h1>

      {/* Sub-navigation tabs bar matching prototype ScreenSettings */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // SAFETY: only the two values declared by this TabsList can be emitted by Radix Tabs.
          setActiveTab(value as "general" | "profile");
        }}
      >
        <TabsList
          className={styles.tabBar}
          aria-label={t("settings.tabs.label", "Settings sections")}
        >
          <TabsTrigger value="general">{t("settings.tabs.general", "General")}</TabsTrigger>
          <TabsTrigger value="profile">{t("settings.tabs.profile", "Profile")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "general" ? (
        <div className={styles.sectionWrap}>
          <p className={styles.sectionLabel}>{t("settings.general.languageSection", "LANGUAGE")}</p>
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

          <p className={styles.sectionLabel}>
            {t("settings.general.displaySection", "APPEARANCE")}
          </p>
          <p className={styles.sectionDesc}>
            {t(
              "settings.general.displayDesc",
              "Try each theme and keep whichever feels most comfortable — this updates the whole app live.",
            )}
          </p>
          {accentTheme === "system" && (
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
          )}
          <div style={{ margin: "10px 0 16px" }}>
            <AccentThemePicker value={accentTheme} onChange={handleAccentThemeChange} />
          </div>

          <p className={styles.sectionLabel}>{t("settings.general.mobileSection", "MOBILE")}</p>
          <div style={{ margin: "8px 0 16px" }}>
            <DownloadAppCard />
          </div>

          <p className={styles.sectionLabel}>
            {t("settings.general.notifSection", "NOTIFICATIONS")}
          </p>
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
                  aria-label={t(
                    "settings.general.followedScholars",
                    "Notify for Followed Scholars",
                  )}
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
        </div>
      ) : (
        <SettingsProfileScreen hideHeader />
      )}
    </ScreenView>
  );
}
