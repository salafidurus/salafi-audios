"use client";

import { useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import styles from "./admin-permissions.screen.mobile.module.css";

export function AdminPermissionsMobileScreen() {
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
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Permissions</h1>

      <div className={styles.lookupSection}>
        <input
          aria-label="User ID"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={styles.input}
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading}
          className={styles.lookupButton}
        >
          {loading ? "…" : "Lookup"}
        </button>
      </div>

      {userPerms && (
        <div>
          {ADMIN_PERMISSIONS.map((perm) => {
            const hasIt = currentPermissions.includes(perm);
            return (
              <div key={perm} className={styles.permissionCard}>
                <div className={styles.permissionInfo}>
                  <div className={styles.permissionName}>{perm}</div>
                  <div
                    className={`${styles.permissionStatus} ${
                      hasIt ? styles.statusGranted : styles.statusNotGranted
                    }`}
                  >
                    {hasIt ? "Granted" : "Not granted"}
                  </div>
                </div>
                {hasIt ? (
                  <button
                    type="button"
                    onClick={() => handleRevoke(perm)}
                    disabled={loading}
                    className={styles.revokeButton}
                  >
                    Revoke
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGrant(perm)}
                    disabled={loading}
                    className={styles.grantButton}
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
