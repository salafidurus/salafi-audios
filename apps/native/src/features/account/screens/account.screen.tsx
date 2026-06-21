import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { useAccountScreen } from "@sd/domain-account";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/i18n";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

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
  const { profile, isFetching } = useAccountScreen();
  const { t } = useTranslation();
  const { hasAnyPermission } = useAdminPermissions();

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("common.loading", "Loading account…")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("account.title", "Account")}</Text>
      {profile ? (
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.profileName}>
              {profile.displayName || t("account.defaultUser", "User")}
            </Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.actions}>
        {hasAnyPermission && (
          <Pressable onPress={onNavigateToAdmin} style={[styles.actionButton, styles.adminButton]}>
            <Text style={styles.adminLabel}>{t("account.admin", "Admin")}</Text>
          </Pressable>
        )}
        <Pressable onPress={onNavigateToProfile} style={styles.actionButton}>
          <Text style={styles.actionLabel}>{t("account.editProfile", "Edit Profile")}</Text>
        </Pressable>
        <Pressable onPress={onNavigateToLegal} style={styles.actionButton}>
          <Text style={styles.actionLabel}>{t("account.legal", "Legal")}</Text>
        </Pressable>
        <Pressable onPress={onSignOut} style={styles.actionButton}>
          <Text style={styles.signOutLabel}>{t("account.signOut", "Sign Out")}</Text>
        </Pressable>
      </View>
      <View style={styles.languageSection}>
        <View>
          <Text style={styles.sectionHeading}>{t("account.language", "Language")}</Text>
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
    color: theme.colors.content.default,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.content.strong,
  },
  profileRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.content.muted,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 8,
    backgroundColor: theme.colors.surface.default,
  },
  actionLabel: {
    fontSize: 15,
    color: theme.colors.content.default,
  },
  adminButton: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  adminLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.action.primary,
  },
  signOutLabel: {
    fontSize: 15,
    color: theme.colors.state.danger,
  },
  languageSection: {
    marginTop: 24,
    gap: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: theme.colors.content.strong,
  },
}));
