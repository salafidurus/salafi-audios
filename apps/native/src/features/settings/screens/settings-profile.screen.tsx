import { useAccountProfile, useUpdateProfile, useDeleteAccount } from "@sd/domain-account";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import { getRtlAwareTextAlign } from "../utils/rtl-text-align";

export type SettingsProfileScreenProps = {
  onSignOut?: () => void;
  onSignIn?: () => void;
};

function ProfileContent({ onSignOut }: SettingsProfileScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSignOutDialogVisible, setIsSignOutDialogVisible] = useState(false);
  const [isDeleteAccountDialogVisible, setIsDeleteAccountDialogVisible] = useState(false);

  useEffect(() => {
    if (!isEditing) setDisplayName(profile?.displayName ?? "");
  }, [profile?.displayName, isEditing]);

  if (isFetching) {
    return (
      <ScreenView center>
        <EmptyState message={t("account.profile.loading", "Loading profile…")} variant="loading" />
      </ScreenView>
    );
  }

  if (!profile) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("account.profile.notAvailable", "Profile not available")}
          variant="empty"
        />
      </ScreenView>
    );
  }

  const isDirty = displayName !== (profile.displayName ?? "");

  const handleSave = () => {
    updateProfile({ displayName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(profile.displayName ?? "");
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountDialogVisible(true);
  };

  const handleSignOut = () => {
    setIsSignOutDialogVisible(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Avatar row */}
      <View style={styles.avatarRow}>
        <UserAvatar name={profile.displayName || profile.email} size={56} />
        <View>
          <AppText variant="bodyLg" style={styles.profileName}>
            {profile.displayName}
          </AppText>
          <AppText variant="bodySm" style={styles.profileEmail}>
            {profile.email}
          </AppText>
        </View>
      </View>

      {/* Account section — display name + email */}
      <SettingsSection title={t("account.title", "Account")}>
        <SettingsRow
          label={t("account.profile.displayName", "Display Name")}
          sublabel={t("account.profile.displayNameSublabel", "Shown across the app")}
          stacked
        >
          <View style={styles.editableField}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t("account.profile.displayNamePlaceholder", "Your display name")}
              placeholderTextColor={theme.colors.content.muted}
              editable={isEditing}
              style={[styles.input, !isEditing && styles.inputDisabled]}
            />
            {!isEditing ? (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
                <AppText variant="bodySm" style={styles.editButtonText}>
                  {t("account.profile.edit", "Edit")}
                </AppText>
              </Pressable>
            ) : (
              <View style={styles.editActions}>
                <Pressable
                  onPress={handleCancel}
                  disabled={isPending}
                  style={[styles.editButton, styles.editButtonOutline]}
                >
                  <AppText variant="bodySm" style={styles.editButtonOutlineText}>
                    {t("account.profile.cancel", "Cancel")}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={!isDirty || isPending}
                  style={[styles.editButton, (!isDirty || isPending) && styles.editButtonDisabled]}
                >
                  <AppText variant="bodySm" style={styles.editButtonText}>
                    {isPending
                      ? t("account.profile.saving", "Saving…")
                      : t("account.profile.save", "Save")}
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        </SettingsRow>
        <SettingsRow label={t("account.profile.email", "Email")} hideBorder>
          <AppText variant="bodySm" style={styles.readOnly}>
            {profile.email}
          </AppText>
        </SettingsRow>
      </SettingsSection>

      {(isSuccess || isError) && (
        <AppText
          variant="caption"
          style={{
            color: isSuccess ? theme.colors.state.successContent : theme.colors.state.dangerContent,
            marginBottom: theme.spacing.scale.sm,
          }}
        >
          {isSuccess
            ? t("account.profile.displayNameSaved", "Display name saved.")
            : t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
        </AppText>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable onPress={handleSignOut} style={styles.actionButton}>
          <AppText variant="bodyMd" style={styles.signOutText}>
            {t("account.signOut", "Sign Out")}
          </AppText>
        </Pressable>
        <Pressable
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
          style={[styles.actionButton, styles.dangerButton]}
        >
          <AppText variant="bodyMd" style={styles.deleteText}>
            {isDeletingAccount
              ? t("account.profile.deleting", "Deleting…")
              : t("account.profile.deleteAccount", "Delete Account")}
          </AppText>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={isSignOutDialogVisible}
        onDismiss={() => setIsSignOutDialogVisible(false)}
        onConfirm={() => {
          setIsSignOutDialogVisible(false);
          onSignOut?.();
        }}
        title={t("account.profile.signOutTitle", "Sign Out?")}
        message={t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}
        confirmLabel={t("account.signOut", "Sign Out")}
        cancelLabel={t("account.profile.cancel", "Cancel")}
        destructive
      />

      <ConfirmDialog
        visible={isDeleteAccountDialogVisible}
        onDismiss={() => setIsDeleteAccountDialogVisible(false)}
        onConfirm={() => {
          setIsDeleteAccountDialogVisible(false);
          deleteAccount(undefined, { onSuccess: () => onSignOut?.() });
        }}
        title={t("account.profile.deleteAccount", "Delete Account")}
        message={t(
          "account.profile.deleteAccountPrompt",
          "This action is permanent and cannot be undone. All your data will be deleted.",
        )}
        confirmLabel={t("account.profile.deleteAccountConfirm", "Delete Account")}
        cancelLabel={t("account.profile.cancel", "Cancel")}
        destructive
      />
    </ScrollView>
  );
}

export function SettingsProfileScreen({ onSignOut, onSignIn }: SettingsProfileScreenProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <ScreenView center>
        <EmptyState message={t("account.profile.loading", "Loading profile…")} variant="loading" />
      </ScreenView>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title={t("account.profile.signInTitle", "Sign in to view your profile")}
        description={t(
          "account.profile.signInDesc",
          "Create an account or sign in to manage your profile and roles.",
        )}
        actionLabel={t("account.profile.signIn", "Sign In")}
        onPress={() => onSignIn?.()}
      />
    );
  }

  return <ProfileContent onSignOut={onSignOut} />;
}

const styles = StyleSheet.create((theme) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.layout.pageX,
    gap: theme.spacing.scale.md,
  },
  screen: { flex: 1, backgroundColor: theme.colors.surface.canvas },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
    gap: theme.spacing.scale.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    marginBottom: theme.spacing.scale.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    color: theme.colors.content.strong,
    fontWeight: "600",
  },
  profileEmail: {
    color: theme.colors.content.muted,
  },
  editableField: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.sm,
  },
  editActions: {
    flexDirection: "row",
    gap: theme.spacing.scale.xs,
  },
  input: {
    fontSize: 14,
    color: theme.colors.content.default,
    textAlign: getRtlAwareTextAlign(theme.direction),
    flex: 1,
  },
  inputDisabled: {
    color: theme.colors.content.muted,
  },
  editButton: {
    paddingVertical: theme.spacing.scale.xs,
    paddingHorizontal: theme.spacing.scale.sm,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.xs,
  },
  editButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editButtonText: {
    color: theme.colors.content.onPrimary,
  },
  editButtonOutlineText: {
    color: theme.colors.content.default,
  },
  readOnly: {
    color: theme.colors.content.muted,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.md,
    marginTop: theme.spacing.scale.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.sm,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    alignItems: "center",
  },
  dangerButton: {
    borderColor: theme.colors.state.danger,
  },
  signOutText: {
    color: theme.colors.content.default,
  },
  deleteText: {
    color: theme.colors.state.danger,
  },
  signInTitle: {
    color: theme.colors.content.strong,
    textAlign: "center",
  },
  signInDesc: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
}));
