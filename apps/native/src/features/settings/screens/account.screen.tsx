import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { useAccountProfile } from "@sd/domain-account";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { AppText } from "@/shared/components/AppText/AppText";

export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToAdmin?: () => void;
  onSignOut?: () => void;
};

export function AccountScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onNavigateToAdmin,
  onSignOut,
}: AccountScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { t } = useTranslation();
  const { hasAnyPermission } = useAdminPermissions();

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <AppText variant="bodyMd">{t("common.loading", "Loading account…")}</AppText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="titleLg" style={styles.title}>
        {t("account.title", "Account")}
      </AppText>
      {profile ? (
        <>
          <View style={styles.profileRow}>
            <View>
              <AppText variant="bodyMd" style={styles.profileName}>
                {profile.displayName || t("account.defaultUser", "User")}
              </AppText>
              <AppText variant="caption" style={styles.profileEmail}>
                {profile.email}
              </AppText>
            </View>
          </View>
          <View style={styles.actions}>
            {hasAnyPermission && (
              <Pressable
                onPress={onNavigateToAdmin}
                style={[styles.actionButton, styles.adminButton]}
              >
                <AppText variant="bodySm" style={styles.adminLabel}>
                  {t("account.admin", "Admin")}
                </AppText>
              </Pressable>
            )}
            <Pressable onPress={onNavigateToProfile} style={styles.actionButton}>
              <AppText variant="bodySm">{t("account.editProfile", "Edit Profile")}</AppText>
            </Pressable>
            <Pressable onPress={onNavigateToLegal} style={styles.actionButton}>
              <AppText variant="bodySm">{t("account.legal", "Legal")}</AppText>
            </Pressable>
            <Pressable onPress={onSignOut} style={styles.actionButton}>
              <AppText variant="bodySm" style={styles.signOutLabel}>
                {t("account.signOut", "Sign Out")}
              </AppText>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.actions}>
          <Pressable onPress={onNavigateToLegal} style={styles.actionButton}>
            <AppText variant="bodySm">{t("account.legal", "Legal")}</AppText>
          </Pressable>
          <Pressable
            onPress={onNavigateToProfile}
            style={[styles.actionButton, styles.signInPrompt]}
          >
            <AppText variant="bodySm" style={styles.signInLabel}>
              {t("account.signInToAccess", "Sign in to access your profile")}
            </AppText>
          </Pressable>
        </View>
      )}
      <View style={styles.languageSection}>
        <View>
          <AppText variant="titleMd" style={styles.sectionHeading}>
            {t("account.language", "Language")}
          </AppText>
          <LanguageSwitch />
        </View>
        <ContentLanguageToggle />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.content.primary,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  title: {
    color: theme.colors.content.strong,
  },
  profileRow: {
    marginTop: theme.spacing.scale.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
  },
  profileName: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  profileEmail: {
    color: theme.colors.content.muted,
  },
  actions: {
    marginTop: theme.spacing.scale["2xl"],
    gap: theme.spacing.component.gapSm,
  },
  actionButton: {
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.default,
  },
  adminButton: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  adminLabel: {
    color: theme.colors.action.primary,
  },
  signOutLabel: {
    color: theme.colors.state.danger,
  },
  signInPrompt: {
    borderColor: theme.colors.action.primary,
  },
  signInLabel: {
    color: theme.colors.action.primary,
  },
  languageSection: {
    marginTop: theme.spacing.scale["2xl"],
    gap: theme.spacing.component.gapLg,
  },
  sectionHeading: {
    marginBottom: theme.spacing.component.gapSm,
    color: theme.colors.content.strong,
  },
}));
