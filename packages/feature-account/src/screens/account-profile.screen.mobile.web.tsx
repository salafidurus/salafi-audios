"use client";

import { useAccountScreen } from "../hooks/use-account";

export type AccountProfileMobileWebScreenProps = {
  onBack?: () => void;
};

export function AccountProfileMobileWebScreen({ onBack }: AccountProfileMobileWebScreenProps) {
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={{ padding: 16 }}>Profile not available</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#2563eb",
            marginBottom: 12,
          }}
        >
          ← Back
        </button>
      )}
      <h1 style={{ margin: 0, fontSize: 20 }}>Edit Profile</h1>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Display Name</span>
          <input
            type="text"
            defaultValue={profile.displayName || ""}
            placeholder="Your display name"
            style={{
              padding: "8px 10px",
              border: "1px solid #d4d4d4",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Email</span>
          <input
            type="email"
            defaultValue={profile.email}
            disabled
            style={{
              padding: "8px 10px",
              border: "1px solid #d4d4d4",
              borderRadius: 6,
              fontSize: 14,
              background: "#f5f5f5",
            }}
          />
        </label>
      </div>
    </div>
  );
}
