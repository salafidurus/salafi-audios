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

function getVisibleRoles(profile: { roles?: string[] }): string[] {
  return profile.roles?.filter((role) => role !== "listener") ?? [];
}

type ProfileEditControlsProps = {
  isEditing: boolean;
  isDirty: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ProfileEditControls({
  isEditing,
  isDirty,
  isPending,
  onEdit,
  onCancel,
  onSave,
  t,
}: ProfileEditControlsProps) {
  if (!isEditing)
    return (
      <Pressable onPress={onEdit} style={styles.editButton}>
        <AppText variant="bodySm" style={styles.editButtonText}>
          {t("account.profile.edit", "Edit")}
        </AppText>
      </Pressable>
    );
  return (
    <View style={styles.editActions}>
      <Pressable
        onPress={onCancel}
        disabled={isPending}
        style={[styles.editButton, styles.editButtonOutline]}
      >
        <AppText variant="bodySm" style={styles.editButtonOutlineText}>
          {t("account.profile.cancel", "Cancel")}
        </AppText>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={!isDirty || isPending}
        style={[styles.editButton, (!isDirty || isPending) && styles.editButtonDisabled]}
      >
        <AppText variant="bodySm" style={styles.editButtonText}>
          {isPending ? t("account.profile.saving", "Saving…") : t("account.profile.save", "Save")}
        </AppText>
      </Pressable>
    </View>
  );
}

function ProfileRoles({
  roles,
  theme,
  t,
}: {
  roles: string[];
  theme: ReturnType<typeof useUnistyles>["theme"];
  t: ProfileEditControlsProps["t"];
}) {
  if (roles.length === 0) return null;
  return (
    <SettingsRow label={t("account.profile.roles", "Roles")} hideBorder>
      <View style={styles.rolesRow}>
        {roles.map((role) => (
          <View
            key={role}
            style={[styles.roleBadge, { backgroundColor: theme.colors.surface.hover }]}
          >
            <AppText variant="caption" style={{ color: theme.colors.content.strong }}>
              {role}
            </AppText>
          </View>
        ))}
      </View>
    </SettingsRow>
  );
}

function ProfileUpdateStatus({
  isSuccess,
  isError,
  theme,
  t,
}: {
  isSuccess: boolean;
  isError: boolean;
  theme: ReturnType<typeof useUnistyles>["theme"];
  t: ProfileEditControlsProps["t"];
}) {
  if (!isSuccess && !isError) return null;
  return (
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
  );
}

type ProfileData = NonNullable<ReturnType<typeof useAccountProfile>["data"]>;

function isProfileInputDisabled(isEditing: boolean) {
  return !isEditing;
}

function getProfileInputStyles(isEditing: boolean) {
  return isProfileInputDisabled(isEditing) ? [styles.input, styles.inputDisabled] : [styles.input];
}

function shouldHideEmailBorder(roles: string[]) {
  return roles.length === 0;
}

function syncProfileDisplayName(
  displayName: string | null | undefined,
  isEditing: boolean,
  setDisplayName: (value: string) => void,
) {
  if (!isEditing) setDisplayName(displayName ?? "");
}

function notifySignOut(onSignOut: (() => void) | undefined) {
  onSignOut?.();
}

function ProfileIdentity({ profile }: { profile: ProfileData }) {
  return (
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
  );
}

function ProfileActions({
  isDeletingAccount,
  onSignOut,
  onDelete,
  t,
}: {
  isDeletingAccount: boolean;
  onSignOut: () => void;
  onDelete: () => void;
  t: ProfileEditControlsProps["t"];
}) {
  return (
    <View style={styles.actionRow}>
      <Pressable onPress={onSignOut} style={styles.actionButton}>
        <AppText variant="bodyMd" style={styles.signOutText}>
          {t("account.signOut", "Sign Out")}
        </AppText>
      </Pressable>
      <Pressable
        onPress={onDelete}
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
  );
}

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
    syncProfileDisplayName(profile?.displayName, isEditing, setDisplayName);
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
  const nonListenerRoles = getVisibleRoles(profile);

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
      <ProfileIdentity profile={profile} />

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
              style={getProfileInputStyles(isEditing)}
            />
            <ProfileEditControls
              isEditing={isEditing}
              isDirty={isDirty}
              isPending={isPending}
              onEdit={() => setIsEditing(true)}
              onCancel={handleCancel}
              onSave={handleSave}
              t={t}
            />
          </View>
        </SettingsRow>
        <SettingsRow
          label={t("account.profile.email", "Email")}
          hideBorder={shouldHideEmailBorder(nonListenerRoles)}
        >
          <AppText variant="bodySm" style={styles.readOnly}>
            {profile.email}
          </AppText>
        </SettingsRow>
        <ProfileRoles roles={nonListenerRoles} theme={theme} t={t} />
      </SettingsSection>

      <ProfileUpdateStatus isSuccess={isSuccess} isError={isError} theme={theme} t={t} />

      <ProfileActions
        isDeletingAccount={isDeletingAccount}
        onSignOut={handleSignOut}
        onDelete={handleDeleteAccount}
        t={t}
      />

      <ConfirmDialog
        visible={isSignOutDialogVisible}
        onDismiss={() => setIsSignOutDialogVisible(false)}
        onConfirm={() => {
          setIsSignOutDialogVisible(false);
          notifySignOut(onSignOut);
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
          deleteAccount(undefined, { onSuccess: () => notifySignOut(onSignOut) });
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
  rolesRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.xs,
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.xs,
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
