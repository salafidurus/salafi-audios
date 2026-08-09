import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useEffect } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { Toggle } from "@/shared/components/Toggle/Toggle";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

type ThemePreference = "system" | "parchment" | "manuscript" | "midnight" | "ember";

interface NotificationState {
  master: boolean;
  scholars: boolean;
  lectures: boolean;
}

export function SettingsGeneralScreen() {
  const { t } = useTranslation();
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [notif, setNotif] = useState<NotificationState>({
    master: true,
    scholars: true,
    lectures: true,
  });

  useEffect(() => {
    const activeTheme = UnistylesRuntime.themeName as ThemePreference;
    if (activeTheme) {
      setThemePreference(activeTheme);
    }
  }, []);

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

  interface ThemeOption {
    value: ThemePreference;
    label: string;
    description: string;
    canvas: string;
    accent: string;
    text: string;
  }

  const themeOptions: ThemeOption[] = [
    {
      value: "system",
      label: t("settings.general.themeOptions.system", "System"),
      description: t("settings.general.themeOptions.systemDesc", "Follow OS"),
      canvas: "#FAF9F6",
      accent: "#B8860B",
      text: "#111111",
    },
    {
      value: "parchment",
      label: t("settings.general.themeOptions.parchment", "Parchment"),
      description: t("settings.general.themeOptions.parchmentDesc", "Ivory & gold"),
      canvas: "#F7F2E7",
      accent: "#B8872E",
      text: "#241C10",
    },
    {
      value: "manuscript",
      label: t("settings.general.themeOptions.manuscript", "Manuscript"),
      description: t("settings.general.themeOptions.manuscriptDesc", "Sepia & dark gold"),
      canvas: "#1C160E",
      accent: "#B58742",
      text: "#E5D9C5",
    },
    {
      value: "midnight",
      label: t("settings.general.themeOptions.midnight", "Midnight"),
      description: t("settings.general.themeOptions.midnightDesc", "Deep black & gold"),
      canvas: "#080808",
      accent: "#E0AE43",
      text: "#F5F5F5",
    },
    {
      value: "ember",
      label: t("settings.general.themeOptions.ember", "Ember"),
      description: t("settings.general.themeOptions.emberDesc", "Charcoal & gold"),
      canvas: "#141210",
      accent: "#D99B26",
      text: "#E6D9C5",
    },
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeScroll}
            contentContainerStyle={styles.themeScrollContent}
          >
            {themeOptions.map((opt) => {
              const isActive = themePreference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleThemeChange(opt.value)}
                  style={[styles.themeCard, isActive && styles.themeCardActive]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.swatchRow}>
                      <View style={[styles.swatchDot, { backgroundColor: opt.canvas }]} />
                      <View style={[styles.swatchDot, { backgroundColor: opt.accent }]} />
                      <View style={[styles.swatchDot, { backgroundColor: opt.text }]} />
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={16} color={opt.accent} />}
                  </View>
                  <View style={styles.cardFooter}>
                    <AppText variant="bodySm" style={styles.cardLabel}>
                      {opt.label}
                    </AppText>
                    <AppText variant="caption" style={styles.cardDesc} numberOfLines={1}>
                      {opt.description}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
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
  themeScroll: {
    marginTop: theme.spacing.scale.xs,
    width: "100%",
  },
  themeScrollContent: {
    paddingRight: theme.spacing.scale.xl,
  },
  themeCard: {
    width: 140,
    height: 100,
    marginRight: theme.spacing.scale.md,
    padding: theme.spacing.scale.md,
    borderRadius: theme.radius.scale.md,
    borderWidth: 2,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.subtle,
    justifyContent: "space-between",
  },
  themeCardActive: {
    borderColor: theme.colors.action.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  swatchRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.xs,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  cardFooter: {
    gap: 2,
  },
  cardLabel: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  cardDesc: {
    color: theme.colors.content.subtle,
  },
}));
