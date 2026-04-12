"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { useAccountScreen } from "@sd/domain-account";
import { LanguageSwitch } from "@/features/i18n";

export type AccountDesktopScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountDesktopScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountDesktopScreenProps) {
  const { profile, isFetching } = useAccountScreen();
  const { t } = useTranslation();

  if (isFetching) {
    return <div style={{ padding: 32 }}>{t("common.loading", "Loading account...")}</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>{t("account.title", "Account")}</h1>
      {profile && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt=""
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {profile.displayName || t("account.defaultUser", "User")}
              </div>
              <div style={{ fontSize: 14, color: "var(--content-muted)" }}>{profile.email}</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          onClick={onNavigateToProfile}
          style={{
            padding: "12px 16px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          {t("account.editProfile", "Edit Profile")}
        </button>
        <button
          type="button"
          onClick={onNavigateToLegal}
          style={{
            padding: "12px 16px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          {t("account.legal", "Legal")}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            padding: "12px 16px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 15,
            color: "var(--action-danger)",
          }}
        >
          {t("account.signOut", "Sign Out")}
        </button>
      </div>
      <div style={{ marginTop: 32 }}>
        <LanguageSwitch />
      </div>
    </div>
  );
}
