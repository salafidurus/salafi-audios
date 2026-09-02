import { hasAnyAdminAccess, useAbility, useAccountProfile } from "@sd/domain-account";
import { Text, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";

import { SettingsRow } from "../components/SettingsRow/SettingsRow";

/**
 * Defines the Settings account destinations and session action callbacks.
 *
 * Profile, Support, Legal, and Admin callbacks are invoked only by their
 * corresponding rows. Admin visibility is derived from the server-backed
 * ability hook; callers must still enforce authorization on the destination.
 * Sign-out is exposed only when an account profile is available.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the public callback contract is documented above.
export type SettingsAccountActionsProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToAdmin?: () => void;
  onSignOut?: () => void;
};

/**
 * Presents account and utility destinations in General Settings.
 *
 * Admin is shown only from the backend-derived ability. This visibility check
 * is a navigation convenience and does not replace server authorization.
 */
export function SettingsAccountActions({
  onNavigateToProfile,
  onNavigateToAdmin,
  onSignOut,
}: SettingsAccountActionsProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { data: profile, isFetching } = useAccountProfile({ enabled: isAuthenticated });
  const { ability } = useAbility({ isAuthenticated });

  if (isFetching) return null;

  const disclosure = <Text style={{ color: theme.colors.content.muted, fontSize: 24 }}>›</Text>;

  return (
    <AccountSettingsSection title={t("account.actions", "Account")} theme={theme}>
      {profile ? (
        <SettingsRow
          label={profile.displayName || t("account.defaultUser", "User")}
          sublabel={profile.email}
        />
      ) : null}
      <SettingsRow
        label={
          profile
            ? t("account.editProfile", "Edit Profile")
            : t("account.signInToAccess", "Sign in to access your profile")
        }
        onPress={onNavigateToProfile}
      >
        {disclosure}
      </SettingsRow>
      {hasAnyAdminAccess(ability) ? (
        <SettingsRow label={t("admin.dashboard.titleMobile", "Admin")} onPress={onNavigateToAdmin}>
          {disclosure}
        </SettingsRow>
      ) : null}
      {profile ? (
        <SettingsRow label={t("account.signOut", "Sign Out")} onPress={onSignOut} />
      ) : null}
    </AccountSettingsSection>
  );
}

/** Renders the final Support and Legal destinations for the Settings screen. */
export function SettingsSupportLegalActions({
  onNavigateToLegal,
  onNavigateToSupport,
}: Pick<SettingsAccountActionsProps, "onNavigateToLegal" | "onNavigateToSupport">) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const disclosure = <Text style={{ color: theme.colors.content.muted, fontSize: 24 }}>›</Text>;

  return (
    <>
      <AccountSettingsSection title={t("settings.support", "Support")} theme={theme}>
        <SettingsRow label={t("settings.support", "Support")} onPress={onNavigateToSupport}>
          {disclosure}
        </SettingsRow>
      </AccountSettingsSection>
      <AccountSettingsSection title={t("account.legal", "Legal")} theme={theme}>
        <SettingsRow label={t("account.legal", "Legal")} onPress={onNavigateToLegal} hideBorder>
          {disclosure}
        </SettingsRow>
      </AccountSettingsSection>
    </>
  );
}

function AccountSettingsSection({
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
          color: theme.colors.content.strong,
          fontSize: 18,
          fontWeight: "600",
          lineHeight: 24,
        }}
      >
        {title}
      </Text>
      <View
        style={{
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
