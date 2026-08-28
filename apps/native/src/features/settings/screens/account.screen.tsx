import { hasAnyAdminAccess, useAbility, useAccountProfile } from "@sd/domain-account";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

/** Provides native account, preference, support, and settings workflows. */
/** Describes the inputs, callbacks, and optional state accepted by Account Screen. */
export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToAdmin?: () => void;
  onSignOut?: () => void;
};

/** Renders the native account screen surface and coordinates its user-facing state. */
export function AccountScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onNavigateToSupport,
  onNavigateToAdmin,
  onSignOut,
}: AccountScreenProps) {
  const { isAuthenticated } = useAuth();
  const { data: profile, isFetching } = useAccountProfile({ enabled: isAuthenticated });
  const { t } = useTranslation();
  const { ability } = useAbility({ isAuthenticated });
  const hasAnyAccess = hasAnyAdminAccess(ability);
  const { theme } = useUnistyles();
  const DisclosureIcon = theme.direction === "rtl" ? ChevronLeft : ChevronRight;

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodyMd">{t("common.loading", "Loading account…")}</AppText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {profile ? (
        <>
          {/* Profile Info Section */}
          <SettingsSection title={t("account.profile.title", "Profile")}>
            <SettingsRow
              label={profile.displayName || t("account.defaultUser", "User")}
              sublabel={profile.email}
            />
            <SettingsRow
              label={t("account.editProfile", "Edit Profile")}
              onPress={onNavigateToProfile}
              hideBorder
            >
              <View testID="account-disclosure-icon">
                <DisclosureIcon size={18} color={theme.colors.content.muted} />
              </View>
            </SettingsRow>
          </SettingsSection>

          {/* Actions Section */}
          <SettingsSection title={t("account.actions", "Actions")}>
            {hasAnyAccess && (
              <SettingsRow
                label={t("admin.dashboard.titleMobile", "Admin")}
                onPress={onNavigateToAdmin}
              >
                <View testID="account-disclosure-icon">
                  <DisclosureIcon size={18} color={theme.colors.content.muted} />
                </View>
              </SettingsRow>
            )}
            <SettingsRow label={t("settings.support", "Support")} onPress={onNavigateToSupport}>
              <View testID="account-disclosure-icon">
                <DisclosureIcon size={18} color={theme.colors.content.muted} />
              </View>
            </SettingsRow>
            <SettingsRow label={t("account.legal", "Legal")} onPress={onNavigateToLegal}>
              <View testID="account-disclosure-icon">
                <DisclosureIcon size={18} color={theme.colors.content.muted} />
              </View>
            </SettingsRow>
            <SettingsRow onPress={onSignOut} hideBorder>
              <AppText variant="bodySm" style={styles.signOutLabel}>
                {t("account.signOut", "Sign Out")}
              </AppText>
            </SettingsRow>
          </SettingsSection>
        </>
      ) : (
        <SettingsSection title={t("account.actions", "Actions")}>
          <SettingsRow label={t("account.legal", "Legal")} onPress={onNavigateToLegal}>
            <View testID="account-disclosure-icon">
              <DisclosureIcon size={18} color={theme.colors.content.muted} />
            </View>
          </SettingsRow>
          <SettingsRow
            label={t("account.signInToAccess", "Sign in to access your profile")}
            onPress={onNavigateToProfile}
            hideBorder
          >
            <View testID="account-disclosure-icon">
              <DisclosureIcon size={18} color={theme.colors.content.muted} />
            </View>
          </SettingsRow>
        </SettingsSection>
      )}

      {/* Language Configuration Section */}
      <SettingsSection
        title={t("account.language", "Language")}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
  },
  title: {
    color: theme.colors.content.strong,
    marginBottom: theme.spacing.scale.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  signOutLabel: {
    color: theme.colors.state.danger,
    fontWeight: "500",
  },
}));
