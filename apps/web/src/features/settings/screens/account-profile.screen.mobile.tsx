"use client";

import { useState } from "react";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./account-profile.screen.mobile.module.css";

export type AccountProfileMobileScreenProps = {
  onBack?: () => void;
};

type AccountProfileMobileFormProps = {
  profile: NonNullable<ReturnType<typeof useAccountProfile>["data"]>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  updateProfile: ReturnType<typeof useUpdateProfile>["mutate"];
  onBack?: () => void;
};

function AccountProfileMobileForm({
  profile,
  isPending,
  isSuccess,
  isError,
  updateProfile,
  onBack,
}: AccountProfileMobileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");

  return (
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
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input type="email" value={profile.email} disabled readOnly className={styles.input} />
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
  );
}

export function AccountProfileMobileScreen({ onBack }: AccountProfileMobileScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();

  return (
    <ScreenView>
      {isFetching ? (
        <p>Loading profile…</p>
      ) : !profile ? (
        <p>Profile not available</p>
      ) : (
        <AccountProfileMobileForm
          profile={profile}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={isError}
          updateProfile={updateProfile}
          onBack={onBack}
        />
      )}
    </ScreenView>
  );
}
