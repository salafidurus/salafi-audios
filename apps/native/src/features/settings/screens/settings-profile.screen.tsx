import { Column, Row, ScrollView } from "@expo/ui";
import { useAccountProfile, useUpdateProfile, useDeleteAccount } from "@sd/domain-account";
import { useEffect, useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { NativeButton, NativeScreenHost, NativeText } from "@/shared/ui";

import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

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
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <EmptyState message={t("account.profile.loading", "Loading profile…")} variant="loading" />
      </NativeScreenHost>
    );
  }

  if (!profile) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <EmptyState
          message={t("account.profile.notAvailable", "Profile not available")}
          variant="empty"
        />
      </NativeScreenHost>
    );
  }

  const isDirty = displayName !== (profile.displayName ?? "");
  const nonListenerRoles = (profile as any).roles?.filter((r: string) => r !== "listener") ?? [];

  const handleSave = () => {
    updateProfile({ displayName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(profile.displayName ?? "");
    setIsEditing(false);
  };

  return (
    <NativeScreenHost testID="settings-profile-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.scale.lg}
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
          }}
        >
          {/* Avatar row */}
          <Row alignment="center" spacing={theme.spacing.scale.md}>
            <UserAvatar name={profile.displayName || profile.email} size={56} />
            <Column spacing={theme.spacing.scale.xs}>
              <NativeText variant="bodyLg" colorRole="strong">
                {profile.displayName}
              </NativeText>
              <NativeText variant="bodySm" colorRole="muted">
                {profile.email}
              </NativeText>
            </Column>
          </Row>

          {/* Account section — display name + email */}
          <SettingsSection title={t("account.title", "Account")}>
            <SettingsRow
              label={t("account.profile.displayName", "Display Name")}
              sublabel={t("account.profile.displayNameSublabel", "Shown across the app")}
              stacked
            >
              <Row alignment="center" spacing={theme.spacing.scale.sm}>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t("account.profile.displayNamePlaceholder", "Your display name")}
                  placeholderTextColor={theme.colors.content.muted}
                  editable={isEditing}
                />
                {!isEditing ? (
                  <NativeButton
                    label={t("account.profile.edit", "Edit")}
                    variant="primary"
                    size="sm"
                    onPress={() => setIsEditing(true)}
                  />
                ) : (
                  <Row spacing={theme.spacing.scale.xs}>
                    <NativeButton
                      label={t("account.profile.cancel", "Cancel")}
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onPress={handleCancel}
                    />
                    <NativeButton
                      label={
                        isPending
                          ? t("account.profile.saving", "Saving…")
                          : t("account.profile.save", "Save")
                      }
                      variant="primary"
                      size="sm"
                      disabled={!isDirty || isPending}
                      onPress={handleSave}
                    />
                  </Row>
                )}
              </Row>
            </SettingsRow>
            <SettingsRow
              label={t("account.profile.email", "Email")}
              hideBorder={nonListenerRoles.length === 0}
            >
              <NativeText variant="bodySm" colorRole="muted">
                {profile.email}
              </NativeText>
            </SettingsRow>
            {nonListenerRoles.length > 0 ? (
              <SettingsRow label={t("account.profile.roles", "Roles")} hideBorder>
                <Row spacing={theme.spacing.scale.xs}>
                  {nonListenerRoles.map((r: string) => (
                    <Column
                      key={r}
                      style={{
                        paddingVertical: 2,
                        paddingHorizontal: theme.spacing.scale.sm,
                        borderRadius: theme.radius.scale.xs,
                        backgroundColor: theme.colors.surface.hover,
                      }}
                    >
                      <NativeText variant="caption" colorRole="strong">
                        {r}
                      </NativeText>
                    </Column>
                  ))}
                </Row>
              </SettingsRow>
            ) : null}
          </SettingsSection>

          {isSuccess || isError ? (
            <NativeText variant="caption" colorRole={isSuccess ? "success" : "danger"}>
              {isSuccess
                ? t("account.profile.displayNameSaved", "Display name saved.")
                : t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
            </NativeText>
          ) : null}

          {/* Actions */}
          <Row spacing={theme.spacing.scale.md}>
            <NativeButton
              label={t("account.signOut", "Sign Out")}
              variant="outline"
              size="md"
              onPress={() => setIsSignOutDialogVisible(true)}
            />
            <NativeButton
              label={
                isDeletingAccount
                  ? t("account.profile.deleting", "Deleting…")
                  : t("account.profile.deleteAccount", "Delete Account")
              }
              variant="danger"
              size="md"
              disabled={isDeletingAccount}
              onPress={() => setIsDeleteAccountDialogVisible(true)}
            />
          </Row>

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
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}

export function SettingsProfileScreen({ onSignOut, onSignIn }: SettingsProfileScreenProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <EmptyState message={t("account.profile.loading", "Loading profile…")} variant="loading" />
      </NativeScreenHost>
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
