"use client";

import { useAccountScreen } from "@sd/domain-account";

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
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading account...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Account</h1>
      {profile && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt=""
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{profile.displayName || "User"}</div>
            <div style={{ fontSize: 13, color: "var(--content-muted)" }}>{profile.email}</div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          type="button"
          onClick={onNavigateToProfile}
          style={{
            padding: "10px 14px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onNavigateToLegal}
          style={{
            padding: "10px 14px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Legal
        </button>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            padding: "10px 14px",
            textAlign: "left",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            background: "var(--surface-default)",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--action-danger)",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
