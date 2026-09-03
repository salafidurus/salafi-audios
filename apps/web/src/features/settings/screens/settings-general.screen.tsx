/** Provides the auth-optional General settings surface and its public destinations. */
"use client";

import { routes } from "@sd/core-contracts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { z } from "zod";

import type { ThemePreference } from "@/core/styles/ThemeSync";

import { useTranslation } from "@/core/i18n/use-translation";
import { THEME_KEY, THEME_CHANGE_EVENT } from "@/core/styles/ThemeSync";
import { SegmentedControl } from "@/features/settings/components/SegmentedControl/SegmentedControl";
import { SettingsRow } from "@/features/settings/components/SettingsRow/SettingsRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection/SettingsSection";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Switch as Toggle } from "@/shared/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
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

/**
 * Renders the auth-optional General settings surface.
 *
 * Preference controls remain local to this tab, while support and legal
 * actions link directly to the canonical public destinations owned by the
 * web application.
 */
export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const isRtl = useIsRtl();
  const NavigationChevron = isRtl ? ChevronLeft : ChevronRight;
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") === "profile" ? "profile" : "general";
  const [activeTab, setActiveTab] = useState<"general" | "profile">(queryTab);
  const lastQueryTab = useRef(queryTab);
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadThemePreference);
  const [notif, setNotif] = useState<NotificationState>(loadNotifState);

  useEffect(() => {
    if (queryTab !== lastQueryTab.current) {
      lastQueryTab.current = queryTab;
      setActiveTab(queryTab);
    }
  }, [queryTab]);

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
      <div className={styles.settingsIntro}>
        <p className={styles.eyebrow}>{t("settings.general.eyebrow")}</p>
        <h1 className={styles.settingsTitle}>{t("settings.general.title", "Settings")}</h1>
        <p className={styles.settingsDescription}>{t("settings.general.description")}</p>
      </div>

      <div className={styles.tabsViewport}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            // SAFETY: only the two values declared by this TabsList can be emitted by Radix Tabs.
            const nextTab = value as "general" | "profile";
            setActiveTab(nextTab);
            const url = new URL(window.location.href);
            if (nextTab === "profile") {
              url.searchParams.set("tab", "profile");
            } else {
              url.searchParams.delete("tab");
            }
            window.history.replaceState(
              window.history.state,
              "",
              `${routes.settings.index}${url.search}`,
            );
          }}
          className={styles.tabs}
        >
          <TabsList
            variant="line"
            className={styles.tabList}
            aria-label={t("settings.tabs.label", "Settings sections")}
          >
            <TabsTrigger value="general" className={styles.tabTrigger}>
              {t("settings.tabs.general", "General")}
            </TabsTrigger>
            <TabsTrigger value="profile" className={styles.tabTrigger}>
              {t("settings.tabs.profile", "Profile")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "general" ? (
        <div className={styles.sectionWrap} data-testid="settings-general-sections">
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

          <SettingsSection title={t("settings.support.title", "Support")}>
            <Link className={styles.settingsRowLink} href={routes.support}>
              {t("settings.support.contact", "Contact Support")}
              <NavigationChevron aria-hidden="true" />
            </Link>
          </SettingsSection>

          <SettingsSection title={t("settings.legal.title", "Legal")}>
            <Link className={styles.settingsRowLink} href={routes.termsOfUse}>
              {t("settings.legal.terms", "Terms and Conditions")}
              <NavigationChevron aria-hidden="true" />
            </Link>
            <Link className={styles.settingsRowLink} href={routes.privacy}>
              {t("settings.legal.privacy", "Privacy Policy")}
              <NavigationChevron aria-hidden="true" />
            </Link>
            <Link className={styles.settingsRowLink} href={routes.cookiePolicy}>
              {t("settings.legal.cookies", "Cookie Policy")}
              <NavigationChevron aria-hidden="true" />
            </Link>
          </SettingsSection>
        </div>
      ) : (
        <SettingsProfileScreen hideHeader />
      )}
    </ScreenView>
  );
}
