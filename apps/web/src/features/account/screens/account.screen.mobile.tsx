"use client";

import Image from "next/image";
import { useTranslation } from "@/core/i18n/use-translation";
import { useAccountProfile } from "@sd/domain-account";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/i18n";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./account.screen.mobile.module.css";

export type AccountMobileScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountMobileScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountMobileScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { t } = useTranslation();

  return (
    <ScreenView>
      {isFetching ? (
        <p>{t("common.loading", "Loading account…")}</p>
      ) : (
        <>
          <h1 className={styles.title}>{t("account.title", "Account")}</h1>
          {profile && (
            <div className={styles.profileRow}>
              {profile.avatarUrl && (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className={styles.avatar}
                />
              )}
              <div>
                <div className={styles.profileName}>
                  {profile.displayName || t("account.defaultUser", "User")}
                </div>
                <div className={styles.profileEmail}>{profile.email}</div>
              </div>
            </div>
          )}
          <div className={styles.actions}>
            <button type="button" onClick={onNavigateToProfile} className={styles.menuButton}>
              {t("account.editProfile", "Edit Profile")}
            </button>
            <button type="button" onClick={onNavigateToLegal} className={styles.menuButton}>
              {t("account.legal", "Legal")}
            </button>
            <button type="button" onClick={onSignOut} className={styles.signOutButton}>
              {t("account.signOut", "Sign Out")}
            </button>
          </div>
          <div className={styles.languageSection}>
            <LanguageSwitch />
            <ContentLanguageToggle />
          </div>
        </>
      )}
    </ScreenView>
  );
}
