import { hasAnyAdminAccess, useAbility, useAccountProfile } from "@sd/domain-account";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

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
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
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
  const identity = getIdentityCopy(profile, t);
  const hasAdminAccess = hasAnyAdminAccess(ability);

  return isFetching ? null : (
    <AccountSettingsSection title={t("settings.accountSection", "Account")} theme={theme}>
      <AccountIdentityRow
        avatarUrl={identity.avatarUrl}
        displayName={identity.displayName}
        email={identity.email}
        accessibilityLabel={identity.accessibilityLabel}
        onPress={onNavigateToProfile}
        theme={theme}
      />
      <AccountAdminRow visible={hasAdminAccess} onPress={onNavigateToAdmin} theme={theme} />
      <AccountSignOutRow visible={Boolean(profile)} onPress={onSignOut} />
    </AccountSettingsSection>
  );
}

function getIdentityCopy(
  profile: NonNullable<ReturnType<typeof useAccountProfile>["data"]> | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (profile) {
    return {
      avatarUrl: profile.avatarUrl,
      displayName: profile.displayName || t("account.defaultUser", "User"),
      email: profile.email,
      accessibilityLabel: profile.displayName || t("account.defaultUser", "User"),
    };
  }
  return {
    avatarUrl: undefined,
    displayName: t("account.guest", "Guest"),
    email: t("account.clickToSignIn", "Click to sign in"),
    accessibilityLabel: t("account.signInToAccess", "Click to sign in"),
  };
}

function AccountIdentityRow({
  avatarUrl,
  displayName,
  email,
  accessibilityLabel,
  onPress,
  theme,
}: {
  avatarUrl?: string | null;
  displayName: string;
  email: string;
  accessibilityLabel: string;
  onPress?: () => void;
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: theme.spacing.component.gapMd,
        minHeight: 72,
        paddingVertical: theme.spacing.scale.md,
      }}
    >
      <UserAvatar image={avatarUrl} name={displayName} size={48} testID="settings-account-avatar" />
      <View style={{ flex: 1, gap: theme.spacing.scale.xs }}>
        <Text style={{ color: theme.colors.content.strong, fontSize: 16, fontWeight: "600" }}>
          {displayName}
        </Text>
        <Text style={{ color: theme.colors.content.muted, fontSize: 14 }}>{email}</Text>
      </View>
      <ChevronRight color={theme.colors.content.muted} size={22} strokeWidth={2.25} />
    </Pressable>
  );
}

function AccountAdminRow({
  visible,
  onPress,
  theme,
}: {
  visible: boolean;
  onPress?: () => void;
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  if (!visible) return null;
  return (
    <SettingsRow label="Admin" onPress={onPress}>
      <ChevronRight color={theme.colors.content.muted} size={22} strokeWidth={2.25} />
    </SettingsRow>
  );
}

function AccountSignOutRow({ visible, onPress }: { visible: boolean; onPress?: () => void }) {
  if (!visible) return null;
  return <SettingsRow label="Sign Out" onPress={onPress} hideBorder />;
}

/** Renders the final Support and Legal destinations for the Settings screen. */
export function SettingsSupportLegalActions({
  onNavigateToTerms,
  onNavigateToPrivacy,
  onNavigateToSupport,
}: Pick<
  SettingsAccountActionsProps,
  "onNavigateToTerms" | "onNavigateToPrivacy" | "onNavigateToSupport"
>) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const disclosure = (
    <ChevronRight color={theme.colors.content.muted} size={22} strokeWidth={2.25} />
  );

  return (
    <>
      <AccountSettingsSection title={t("settings.supportSection", "Support")} theme={theme}>
        <SettingsRow
          label={t("settings.contactSupport", "Contact support")}
          onPress={onNavigateToSupport}
          hideBorder
        >
          {disclosure}
        </SettingsRow>
      </AccountSettingsSection>
      <AccountSettingsSection title={t("account.legal", "Legal")} theme={theme}>
        <SettingsRow
          label={t("settings.legalTermsLabel", "Terms and Conditions")}
          onPress={onNavigateToTerms}
        >
          {disclosure}
        </SettingsRow>
        <SettingsRow
          label={t("settings.legalPrivacyLabel", "Privacy Policy")}
          onPress={onNavigateToPrivacy}
          hideBorder
        >
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
