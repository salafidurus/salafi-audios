"use client";

import { useAccountScreen } from "../hooks/use-account";

export type AccountDesktopWebScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountDesktopWebScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountDesktopWebScreenProps) {
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading account...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Account</h1>
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
              <div style={{ fontSize: 18, fontWeight: 600 }}>{profile.displayName || "User"}</div>
              <div style={{ fontSize: 14, color: "#666" }}>{profile.email}</div>
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
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onNavigateToLegal}
          style={{
            padding: "12px 16px",
            textAlign: "left",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Legal
        </button>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            padding: "12px 16px",
            textAlign: "left",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 15,
            color: "#dc2626",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
