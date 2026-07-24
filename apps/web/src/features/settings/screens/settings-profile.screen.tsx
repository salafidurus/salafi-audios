"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/core/auth";
import { useAccountProfile, useUpdateProfile, useDeleteAccount } from "@sd/domain-account";
import { authClient } from "@/core/auth/auth-client";
import { AuthModal } from "@/features/auth";
import { Modal } from "@/shared/components/Modal";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { SettingsSection } from "@/features/settings/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/features/settings/components/SettingsRow/SettingsRow";
import { Button } from "@/shared/components/Button/Button";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./settings-profile.screen.module.css";

function ProfileContent() {
  const { t } = useTranslation();
  const {
    data: profile,
    isFetching: isLoadingProfile,
    isError: isProfileLoadError,
    error: profileLoadError,
  } = useAccountProfile();
  const {
    mutate: updateProfile,
    isPending: isUpdatingProfile,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateProfile();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      if (typeof window !== "undefined" && window.location && !process.env.VITEST) {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        authClient.signOut();
        router.push("/");
      },
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName ?? "");
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile({ displayName });
    setIsEditing(false);
  };

  if (isLoadingProfile) {
    return (
      <EmptyState variant="loading" message={t("account.profile.loading", "Loading profile…")} />
    );
  }

  if (isProfileLoadError) {
    const errorMessage =
      profileLoadError instanceof Error
        ? profileLoadError.message
        : t("account.profile.loadError", "Failed to load profile");
    return <EmptyState variant="error" message={errorMessage} />;
  }

  if (!profile) {
    return <EmptyState message={t("account.profile.notAvailable", "Profile not available.")} />;
  }

  const currentDisplayName = displayName;
  const isDirty = currentDisplayName !== (profile.displayName ?? "");
  const nonListenerRoles = profile.roles.filter((r) => r !== "listener");

  return (
    <>
      <div className={styles.avatarRow}>
        <UserAvatar
          image={profile.avatarUrl ?? null}
          name={profile.displayName || profile.email}
          size={72}
        />
        <div>
          <p className={styles.profileName}>{profile.displayName}</p>
          <p className={styles.profileEmail}>{profile.email}</p>
        </div>
      </div>

      <SettingsSection title={t("account.title", "Account")}>
        <SettingsRow
          label={t("account.profile.displayName", "Display Name")}
          sublabel={t("account.profile.displayNameSublabel", "Shown across the app")}
        >
          <div className={styles.editableField}>
            <input
              id="settings-display-name"
              type="text"
              className={styles.input}
              value={currentDisplayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("account.profile.displayNamePlaceholder", "Your display name")}
              aria-label={t("account.profile.displayNameAria", "Display name")}
              disabled={!isEditing}
            />
            {!isEditing ? (
              <Button onClick={handleEdit}>{t("account.profile.edit", "Edit")}</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isUpdatingProfile}>
                  {t("account.profile.cancel", "Cancel")}
                </Button>
                <Button
                  disabled={!isDirty || isUpdatingProfile}
                  onClick={handleSave}
                  loading={isUpdatingProfile}
                >
                  {isUpdatingProfile
                    ? t("account.profile.saving", "Saving…")
                    : t("account.profile.save", "Save")}
                </Button>
              </>
            )}
          </div>
        </SettingsRow>
        <SettingsRow label={t("account.profile.email", "Email")}>
          <span className={styles.readOnly}>{profile.email}</span>
        </SettingsRow>
      </SettingsSection>

      {(isUpdateSuccess || isUpdateError) && (
        <p className={isUpdateSuccess ? styles.successText : styles.errorText}>
          {isUpdateSuccess
            ? t("account.profile.displayNameSaved", "Display name saved.")
            : t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
        </p>
      )}

      <SettingsSection title={t("account.title", "Account")}>
        <SettingsRow label={t("account.profile.emailVerified", "Email Verified")}>
          <span className={profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {profile.emailVerified
              ? t("account.profile.verified", "Verified")
              : t("account.profile.unverified", "Unverified")}
          </span>
        </SettingsRow>
        {nonListenerRoles.length > 0 && (
          <SettingsRow label={t("account.profile.roles", "Roles")}>
            <div className={styles.rolesRow}>
              {nonListenerRoles.map((r) => (
                <span key={r} className={styles.roleBadge}>
                  {r}
                </span>
              ))}
            </div>
          </SettingsRow>
        )}
      </SettingsSection>

      <div className={styles.actionRow}>
        <Button
          variant="outline"
          data-testid="sign-out-trigger"
          onClick={() => setShowSignOutModal(true)}
        >
          {t("account.signOut", "Sign Out")}
        </Button>
        <Button
          variant="danger"
          data-testid="delete-account-trigger"
          onClick={() => setShowDeleteAccountModal(true)}
          disabled={isDeletingAccount}
          loading={isDeletingAccount}
        >
          {isDeletingAccount
            ? t("account.profile.deleting", "Deleting…")
            : t("account.profile.deleteAccount", "Delete Account")}
        </Button>
      </div>

      <Modal.ConfirmDialog
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title={t("account.profile.signOutTitle", "Sign Out?")}
        confirmLabel={t("account.profile.signOutConfirm", "Sign Out")}
        confirmVariant="danger"
        testId="confirm-modal-confirm"
        cancelTestId="confirm-modal-cancel"
        modalTestId="confirm-modal"
      >
        <p>{t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}</p>
      </Modal.ConfirmDialog>

      <Modal.ConfirmText
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        title={t("account.profile.deleteAccount", "Delete Account")}
        message={t(
          "account.profile.deleteAccountPrompt",
          "This action is permanent and cannot be undone. All your data will be deleted.",
        )}
        confirmLabel={t("account.profile.deleteAccountConfirm", "Delete Account")}
        confirmVariant="danger"
        confirmWord={t("account.profile.deleteConfirmWord", "DELETE")}
        testId="confirm-modal-confirm"
        modalTestId="delete-account-modal"
      />
    </>
  );
}

function SignInCta() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.signInCta}>
      <p className={styles.signInTitle}>
        {t("account.profile.signInCta", "Sign in to view your profile and roles.")}
      </p>
      <p className={styles.signInDesc}>
        {t(
          "account.profile.signInDesc",
          "Create an account or sign in to manage your profile and roles.",
        )}
      </p>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        {t("account.profile.signIn", "Sign In")}
      </Button>
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={t("account.profile.signInCta", "Sign in to view your profile and roles.")}
      />
    </div>
  );
}

export function SettingsProfileScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <PageHeader title={t("account.profile.title", "Profile")} />
      {isLoading ? null : isAuthenticated ? <ProfileContent /> : <SignInCta />}
    </ScreenView>
  );
}
