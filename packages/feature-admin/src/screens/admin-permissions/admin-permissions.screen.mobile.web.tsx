"use client";

import { useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "../../api/admin.api";

export function AdminPermissionsMobileWebScreen() {
  const [userId, setUserId] = useState("");
  const [userPerms, setUserPerms] = useState<AdminPermissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    try {
      const data = await fetchUserPermissions(userId.trim());
      setUserPerms(data);
    } catch {
      setUserPerms({ permissions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (permission: AdminPermission) => {
    setLoading(true);
    try {
      const data = await grantPermission(userId.trim(), permission);
      setUserPerms(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permission: string) => {
    setLoading(true);
    try {
      const data = await revokePermission(userId.trim(), permission);
      setUserPerms(data);
    } finally {
      setLoading(false);
    }
  };

  const currentPermissions = userPerms?.permissions.map((p) => p.permission) ?? [];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Permissions</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 13,
          }}
        >
          {loading ? "..." : "Lookup"}
        </button>
      </div>

      {userPerms && (
        <div>
          {ADMIN_PERMISSIONS.map((perm) => {
            const hasIt = currentPermissions.includes(perm);
            return (
              <div
                key={perm}
                style={{
                  padding: 12,
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 13 }}>{perm}</div>
                  <div style={{ fontSize: 11, color: hasIt ? "#16a34a" : "#999" }}>
                    {hasIt ? "Granted" : "Not granted"}
                  </div>
                </div>
                {hasIt ? (
                  <button
                    onClick={() => handleRevoke(perm)}
                    disabled={loading}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#dc2626",
                      fontSize: 11,
                    }}
                  >
                    Revoke
                  </button>
                ) : (
                  <button
                    onClick={() => handleGrant(perm)}
                    disabled={loading}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "none",
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: 11,
                    }}
                  >
                    Grant
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
