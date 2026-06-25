"use client";

import { useState, useEffect } from "react";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./account-profile.screen.desktop.module.css";

export type AccountProfileDesktopScreenProps = {
  onBack?: () => void;
};

export function AccountProfileDesktopScreen({ onBack }: AccountProfileDesktopScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile) setDisplayName(profile.displayName ?? "");
  }, [profile]);

  return (
    <ScreenView>
      <div className={styles.page}>
        {isFetching ? (
          <p>Loading profile…</p>
        ) : !profile ? (
          <p>Profile not available</p>
        ) : (
          <>
            {onBack && (
              <button type="button" onClick={onBack} className={styles.backButton}>
                ← Back to Account
              </button>
            )}
            <h1 className={styles.title}>Edit Profile</h1>
            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Display Name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={styles.input}
                />
              </label>
            </div>
            <div className={styles.actions}>
              {isError && <p className={styles.errorText}>Failed to save. Please try again.</p>}
              {isSuccess && <p className={styles.successText}>Saved.</p>}
              <button
                type="button"
                onClick={() => updateProfile({ displayName })}
                disabled={isPending || displayName === profile.displayName}
                className={styles.saveButton}
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </ScreenView>
  );
}
