/** Native account overview surface delegating profile and session behavior. */
/** Renders the account overview and its authenticated settings actions. */
import { Column, ScrollView } from "@expo/ui";
import { hasAnyAdminAccess, useAbility, useAccountProfile } from "@sd/domain-account";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeIcon, NativeScreenHost, NativeText } from "@/shared/ui";

import { ContentLanguageToggle } from "../components/content-language-toggle/content-language-toggle";
import { LanguageSwitch } from "../components/language-switch/language-switch";
import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

/** Carries optional callbacks for profile, legal, support, admin, and sign-out actions. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToAdmin?: () => void;
  onSignOut?: () => void;
};

/** Renders authenticated account actions or the unauthenticated entry state. */
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

  if (isFetching) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <NativeText variant="bodyMd">{t("common.loading", "Loading account…")}</NativeText>
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="account-screen-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.layout.sectionY}
          style={{ padding: theme.spacing.layout.pageX }}
        >
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
                  <NativeIcon
                    testID="account-disclosure-icon"
                    name="forward"
                    size={18}
                    color={theme.colors.content.muted}
                  />
                </SettingsRow>
              </SettingsSection>

              {/* Actions Section */}
              <SettingsSection title={t("account.actions", "Actions")}>
                {hasAnyAccess ? (
                  <SettingsRow
                    label={t("admin.dashboard.titleMobile", "Admin")}
                    onPress={onNavigateToAdmin}
                  >
                    <NativeIcon
                      testID="account-disclosure-icon"
                      name="forward"
                      size={18}
                      color={theme.colors.content.muted}
                    />
                  </SettingsRow>
                ) : null}
                <SettingsRow label={t("settings.support", "Support")} onPress={onNavigateToSupport}>
                  <NativeIcon
                    testID="account-disclosure-icon"
                    name="forward"
                    size={18}
                    color={theme.colors.content.muted}
                  />
                </SettingsRow>
                <SettingsRow label={t("account.legal", "Legal")} onPress={onNavigateToLegal}>
                  <NativeIcon
                    testID="account-disclosure-icon"
                    name="forward"
                    size={18}
                    color={theme.colors.content.muted}
                  />
                </SettingsRow>
                <SettingsRow onPress={onSignOut} hideBorder>
                  <NativeText variant="bodySm" colorRole="danger">
                    {t("account.signOut", "Sign Out")}
                  </NativeText>
                </SettingsRow>
              </SettingsSection>
            </>
          ) : (
            <SettingsSection title={t("account.actions", "Actions")}>
              <SettingsRow label={t("account.legal", "Legal")} onPress={onNavigateToLegal}>
                <NativeIcon
                  testID="account-disclosure-icon"
                  name="forward"
                  size={18}
                  color={theme.colors.content.muted}
                />
              </SettingsRow>
              <SettingsRow
                label={t("account.signInToAccess", "Sign in to access your profile")}
                onPress={onNavigateToProfile}
                hideBorder
              >
                <NativeIcon
                  testID="account-disclosure-icon"
                  name="forward"
                  size={18}
                  color={theme.colors.content.muted}
                />
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
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
