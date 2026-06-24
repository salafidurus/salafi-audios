"use client";

import { useAccountProfile } from "@sd/domain-account";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./account-profile.screen.mobile.module.css";

export type AccountProfileMobileScreenProps = {
  onBack?: () => void;
};

export function AccountProfileMobileScreen({ onBack }: AccountProfileMobileScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();

  return (
    <ScreenView>
      {isFetching ? (
        <p>Loading profile…</p>
      ) : !profile ? (
        <p>Profile not available</p>
      ) : (
        <>
          {onBack && (
            <button type="button" onClick={onBack} className={styles.backButton}>
              ← Back
            </button>
          )}
          <h1 className={styles.title}>Edit Profile</h1>
          <div className={styles.form}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Display Name</span>
              <input
                type="text"
                defaultValue={profile.displayName || ""}
                placeholder="Your display name"
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input type="email" defaultValue={profile.email} disabled className={styles.input} />
            </label>
          </div>
        </>
      )}
    </ScreenView>
  );
}
