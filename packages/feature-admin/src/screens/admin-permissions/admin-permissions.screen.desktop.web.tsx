"use client";

import { useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "../../api/admin.api";

export function AdminPermissionsDesktopWebScreen() {
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
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Manage Permissions</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Lookup"}
        </button>
      </div>

      {userPerms && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            Permissions for {userId}
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
                <th style={{ padding: 8 }}>Permission</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_PERMISSIONS.map((perm) => {
                const hasIt = currentPermissions.includes(perm);
                return (
                  <tr key={perm} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>{perm}</td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          background: hasIt ? "#dcfce7" : "#f3f4f6",
                          color: hasIt ? "#16a34a" : "#999",
                        }}
                      >
                        {hasIt ? "Granted" : "Not granted"}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      {hasIt ? (
                        <button
                          onClick={() => handleRevoke(perm)}
                          disabled={loading}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            border: "1px solid #fca5a5",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGrant(perm)}
                          disabled={loading}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            border: "none",
                            background: "#16a34a",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Grant
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
