"use client";

import { useState } from "react";
import { useAuth } from "@/core/auth";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { authClient } from "@/core/auth/auth-client";
import { AuthModal } from "@/features/auth";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { SettingsSection } from "@/shared/components/SettingsSection/SettingsSection";
import { SettingsRow } from "@/shared/components/SettingsRow/SettingsRow";
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
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();
  const router = useRouter();
  const [prevProfileId, setPrevProfileId] = useState(profile?.id);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");

  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setDisplayName(profile.displayName ?? "");
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isFetching) {
    return <EmptyState variant="loading" message="Loading profile…" />;
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
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={profile.avatarUrl} alt="" className={styles.avatarImage} />
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
            />
            <button
              type="button"
              className={styles.saveButton}
              disabled={!isDirty || isPending}
              onClick={() => updateProfile({ displayName: currentDisplayName })}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </SettingsRow>
        <SettingsRow label="Email">
          <span className={styles.readOnly}>{profile.email}</span>
        </SettingsRow>
      </SettingsSection>

      {(isSuccess || isError) && (
        <p className={isSuccess ? styles.successText : styles.errorText}>
          {isSuccess ? "Display name saved." : "Failed to save. Please try again."}
        </p>
      )}

      <SettingsSection title="Roles &amp; Access">
        <SettingsRow label="Role">
          <span className={styles.roleBadge}>{profile.role}</span>
        </SettingsRow>
        <SettingsRow label="Email Verified">
          <span className={profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {profile.emailVerified ? "Verified" : "Unverified"}
          </span>
        </SettingsRow>
      </SettingsSection>

      <div className={styles.signOutRow}>
        <button type="button" className={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
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
