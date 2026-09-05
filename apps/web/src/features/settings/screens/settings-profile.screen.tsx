/** Documents this module's responsibility and public boundary. */
"use client";

import { useAccountProfile, useUpdateProfile, useDeleteAccount } from "@sd/domain-account";
import { Check, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "@/core/auth";
import { authClient } from "@/core/auth/auth-client";
import { useSignOut } from "@/core/auth/use-sign-out";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthModal } from "@/features/auth";
import { SettingsRow } from "@/features/settings/components/SettingsRow/SettingsRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection/SettingsSection";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Button } from "@/shared/components/ui/button";
import {
  ConfirmationDialog,
  ConfirmationTextDialog,
} from "@/shared/components/ui/confirmation-dialog";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

import styles from "./settings-profile.screen.module.css";

type ProfileEditActionsProps = {
  isEditing: boolean;
  isDirty: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ProfileEditActions({
  isEditing,
  isDirty,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  t,
}: ProfileEditActionsProps) {
  if (!isEditing) return <Button onClick={onEdit}>{t("account.profile.edit", "Edit")}</Button>;
  return (
    <>
      <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
        {t("account.profile.cancel", "Cancel")}
      </Button>
      <Button disabled={!isDirty || isUpdating} onClick={onSave}>
        {isUpdating ? t("account.profile.saving", "Saving…") : t("account.profile.save", "Save")}
      </Button>
    </>
  );
}

function ProfileAccountStatus({
  profile,
  roles,
  t,
}: {
  profile: { email: string; emailVerified: boolean };
  /** Roles returned by the account profile and displayed as badges. */
  roles: string[];
  t: ProfileEditActionsProps["t"];
}) {
  return (
    <SettingsSection title={t("account.title", "Account")}>
      <SettingsRow label={t("account.profile.emailVerified", "Email Verified")}>
        <span className={profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
          {profile.emailVerified
            ? t("account.profile.verified", "Verified")
            : t("account.profile.unverified", "Unverified")}
        </span>
      </SettingsRow>
      {roles.length > 0 && (
        <SettingsRow label={t("account.profile.roles", "Roles")}>
          <div className={styles.rolesRow}>
            {roles.map((role) => (
              <span key={role} className={styles.roleBadge}>
                {role}
              </span>
            ))}
          </div>
        </SettingsRow>
      )}
    </SettingsSection>
  );
}

function ProfileUpdateStatus({
  isSuccess,
  isError,
  t,
}: {
  isSuccess: boolean;
  /** Whether the latest display-name mutation failed. */
  isError: boolean;
  t: ProfileEditActionsProps["t"];
}) {
  if (!isSuccess && !isError) return null;

  return (
    <p className={isSuccess ? styles.successText : styles.errorText}>
      {isSuccess
        ? t("account.profile.displayNameSaved", "Display name saved.")
        : t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
    </p>
  );
}

function getProfileLoadErrorMessage(
  errorMessage: string | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  return errorMessage ? errorMessage : t("account.profile.loadError", "Failed to load profile");
}

type ProfileData = NonNullable<ReturnType<typeof useAccountProfile>["data"]>;

function ProfileIdentity({ profile }: { profile: ProfileData }) {
  return (
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
  );
}

function ProfileActionRow({
  isDeletingAccount,
  onSignOut,
  onDelete,
  t,
}: {
  isDeletingAccount: boolean;
  onSignOut: () => void;
  onDelete: () => void;
  t: ProfileEditActionsProps["t"];
}) {
  return (
    <div className={styles.actionRow}>
      <Button variant="outline" data-testid="sign-out-trigger" onClick={onSignOut}>
        {t("account.signOut", "Sign Out")}
      </Button>
      <Button
        variant="destructive"
        data-testid="delete-account-trigger"
        onClick={onDelete}
        disabled={isDeletingAccount}
      >
        {isDeletingAccount
          ? t("account.profile.deleting", "Deleting…")
          : t("account.profile.deleteAccount", "Delete Account")}
      </Button>
    </div>
  );
}

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
  const { signOut, error: signOutError } = useSignOut();
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
    return (
      <EmptyState
        variant="error"
        message={getProfileLoadErrorMessage(profileLoadError?.message, t)}
      />
    );
  }

  if (!profile) {
    return <EmptyState message={t("account.profile.notAvailable", "Profile not available.")} />;
  }

  const currentDisplayName = displayName;
  const isDirty = currentDisplayName !== (profile.displayName ?? "");
  const nonListenerRoles = profile.roles.filter((r) => r !== "listener");

  return (
    <>
      <ProfileIdentity profile={profile} />

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
            <ProfileEditActions
              isEditing={isEditing}
              isDirty={isDirty}
              isUpdating={isUpdatingProfile}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              t={t}
            />
          </div>
        </SettingsRow>
        <SettingsRow label={t("account.profile.email", "Email")}>
          <span className={styles.readOnly}>{profile.email}</span>
        </SettingsRow>
      </SettingsSection>

      <ProfileUpdateStatus isSuccess={isUpdateSuccess} isError={isUpdateError} t={t} />

      <ProfileAccountStatus profile={profile} roles={nonListenerRoles} t={t} />

      <ProfileActionRow
        isDeletingAccount={isDeletingAccount}
        onSignOut={() => setShowSignOutModal(true)}
        onDelete={() => setShowDeleteAccountModal(true)}
        t={t}
      />

      <ConfirmationDialog
        open={showSignOutModal}
        onOpenChange={setShowSignOutModal}
        onConfirm={signOut}
        title={t("account.profile.signOutTitle", "Sign Out?")}
        confirmLabel={t("account.profile.signOutConfirm", "Sign Out")}
        variant="destructive"
        testId="confirm-modal-confirm"
        cancelTestId="confirm-modal-cancel"
        modalTestId="confirm-modal"
      >
        <p>{t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}</p>
        {signOutError && <p role="alert">{signOutError}</p>}
      </ConfirmationDialog>

      <ConfirmationTextDialog
        open={showDeleteAccountModal}
        onOpenChange={setShowDeleteAccountModal}
        onConfirm={handleDeleteAccount}
        title={t("account.profile.deleteAccount", "Delete Account")}
        message={t(
          "account.profile.deleteAccountPrompt",
          "This action is permanent and cannot be undone. All your data will be deleted.",
        )}
        confirmLabel={t("account.profile.deleteAccountConfirm", "Delete Account")}
        variant="destructive"
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
  const benefits = [
    t("account.profile.benefit1", "Sync progress across devices"),
    t("account.profile.benefit2", "Save lectures to your library"),
    t("account.profile.benefit3", "Pick up exactly where you left off"),
  ];

  return (
    <div className={styles.signInCta}>
      <div className={styles.iconBadge}>
        <LogIn size={22} color="var(--action-primary)" />
      </div>
      <h3 className={styles.signInTitle}>
        {t("account.profile.signInHeader", "Sign in to Salafi Durus")}
      </h3>
      <p className={styles.signInDesc}>
        {t(
          "account.profile.signInDesc",
          "Keep your progress, saved durus, and playback position in sync across every device.",
        )}
      </p>
      <div className={styles.bulletList}>
        {benefits.map((b) => (
          <div key={b} className={styles.bulletRow}>
            <div className={styles.checkCircle}>
              <Check size={11} color="var(--action-primary)" />
            </div>
            <span className={styles.bulletText}>{b}</span>
          </div>
        ))}
      </div>
      <Button className="w-full" onClick={() => setShowModal(true)}>
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

/** Renders authenticated profile settings or the anonymous sign-in call to action. */
export function SettingsProfileScreen({ hideHeader = false }: { hideHeader?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (hideHeader) {
    return isLoading ? null : isAuthenticated ? <ProfileContent /> : <SignInCta />;
  }

  return (
    <ScreenView>
      <PageHeader title={t("account.profile.title", "Profile")} />
      {isLoading ? null : isAuthenticated ? <ProfileContent /> : <SignInCta />}
    </ScreenView>
  );
}
