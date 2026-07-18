"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/core/auth";
import { useAccountProfile, useUpdateProfile, useDeleteAccount } from "@sd/domain-account";
import { authClient } from "@/core/auth/auth-client";
import { AuthModal } from "@/features/auth";
import { Modal } from "@/shared/components/Modal";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
import { Button } from "@/shared/components/Button/Button";
import { useRouter } from "next/navigation";
import styles from "./settings-profile.screen.module.css";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfileContent() {
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
  const [prevProfileId, setPrevProfileId] = useState(profile?.id);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setDisplayName(profile.displayName ?? "");
  }

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
    return <EmptyState variant="loading" message="Loading profile…" />;
  }

  if (isProfileLoadError) {
    const errorMessage =
      profileLoadError instanceof Error ? profileLoadError.message : "Failed to load profile";
    return <EmptyState variant="error" message={errorMessage} />;
  }

  if (!profile) {
    return <EmptyState message="Profile not available." />;
  }

  const currentDisplayName = displayName;
  const isDirty = currentDisplayName !== (profile.displayName ?? "");

  const initials = getInitials(profile.displayName || profile.email);

  return (
    <>
      <div className={styles.avatarRow}>
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="User avatar"
            width={72}
            height={72}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarInitials} aria-hidden="true">
            {initials}
          </div>
        )}
        <div>
          <p className={styles.profileName}>{profile.displayName}</p>
          <p className={styles.profileEmail}>{profile.email}</p>
        </div>
      </div>

      <SettingsSection title="Account">
        <SettingsRow label="Display Name" sublabel="Shown across the app">
          <div className={styles.editableField}>
            <input
              id="settings-display-name"
              type="text"
              className={styles.input}
              value={currentDisplayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              aria-label="Display name"
              disabled={!isEditing}
            />
            {!isEditing ? (
              <Button onClick={handleEdit}>Edit</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isUpdatingProfile}>
                  Cancel
                </Button>
                <Button
                  disabled={!isDirty || isUpdatingProfile}
                  onClick={handleSave}
                  loading={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving…" : "Save"}
                </Button>
              </>
            )}
          </div>
        </SettingsRow>
        <SettingsRow label="Email">
          <span className={styles.readOnly}>{profile.email}</span>
        </SettingsRow>
      </SettingsSection>

      {(isUpdateSuccess || isUpdateError) && (
        <p className={isUpdateSuccess ? styles.successText : styles.errorText}>
          {isUpdateSuccess ? "Display name saved." : "Failed to save. Please try again."}
        </p>
      )}

      <SettingsSection title="Account">
        <SettingsRow label="Email Verified">
          <span className={profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {profile.emailVerified ? "Verified" : "Unverified"}
          </span>
        </SettingsRow>
      </SettingsSection>

      <div className={styles.actionRow}>
        <Button
          variant="secondary"
          data-testid="sign-out-trigger"
          onClick={() => setShowSignOutModal(true)}
        >
          Sign Out
        </Button>
        <Button
          variant="danger"
          data-testid="delete-account-trigger"
          onClick={() => setShowDeleteAccountModal(true)}
          disabled={isDeletingAccount}
          loading={isDeletingAccount}
        >
          {isDeletingAccount ? "Deleting…" : "Delete Account"}
        </Button>
      </div>

      <Modal.ConfirmDialog
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out?"
        confirmLabel="Sign Out"
        confirmVariant="danger"
        testId="confirm-modal-confirm"
        cancelTestId="confirm-modal-cancel"
        modalTestId="confirm-modal"
      >
        <p>Are you sure you want to sign out?</p>
      </Modal.ConfirmDialog>

      <Modal.ConfirmText
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action is permanent and cannot be undone. All your data will be deleted."
        confirmLabel="Delete Account"
        confirmVariant="danger"
        confirmWord="DELETE"
        testId="confirm-modal-confirm"
        modalTestId="delete-account-modal"
      />
    </>
  );
}

function SignInCta() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.signInCta}>
      <p className={styles.signInTitle}>Sign in to view your profile and roles.</p>
      <p className={styles.signInDesc}>
        Create an account or sign in to manage your profile and roles.
      </p>
      <button type="button" className={styles.signInButton} onClick={() => setShowModal(true)}>
        Sign In
      </button>
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message="Sign in to view your profile and roles."
      />
    </div>
  );
}

export function SettingsProfileScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <ScreenView>
      <PageHeader title="Profile" />
      {isLoading ? null : isAuthenticated ? <ProfileContent /> : <SignInCta />}
    </ScreenView>
  );
}
