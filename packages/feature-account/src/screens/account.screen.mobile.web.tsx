"use client";

import { useAccountScreen } from "../hooks/use-account";

export type AccountMobileWebScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountMobileWebScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountMobileWebScreenProps) {
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
            <div style={{ fontSize: 13, color: "#666" }}>{profile.email}</div>
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
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
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
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
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
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            color: "#dc2626",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
