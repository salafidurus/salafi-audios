"use client";

import { useAccountScreen } from "../hooks/use-account";

export type AccountProfileDesktopWebScreenProps = {
  onBack?: () => void;
};

export function AccountProfileDesktopWebScreen({ onBack }: AccountProfileDesktopWebScreenProps) {
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={{ padding: 32 }}>Profile not available</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "#2563eb",
            marginBottom: 16,
          }}
        >
          ← Back to Account
        </button>
      )}
      <h1 style={{ margin: 0, fontSize: 24 }}>Edit Profile</h1>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Display Name</span>
          <input
            type="text"
            defaultValue={profile.displayName || ""}
            placeholder="Your display name"
            style={{
              padding: "8px 12px",
              border: "1px solid #d4d4d4",
              borderRadius: 6,
              fontSize: 15,
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
          <input
            type="email"
            defaultValue={profile.email}
            disabled
            style={{
              padding: "8px 12px",
              border: "1px solid #d4d4d4",
              borderRadius: 6,
              fontSize: 15,
              background: "#f5f5f5",
            }}
          />
        </label>
      </div>
    </div>
  );
}
