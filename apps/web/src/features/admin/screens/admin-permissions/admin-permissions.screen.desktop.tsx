"use client";

import { useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import styles from "./admin-permissions.screen.desktop.module.css";

export function AdminPermissionsDesktopScreen() {
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
    <ScreenView>
      <PageHeader title="Manage Permissions" />

      <div className={styles.lookupSection}>
        <input
          aria-label="User ID"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          className={styles.input}
        />
        <Button variant="primary" onClick={handleLookup} disabled={loading}>
          {loading ? "Loading…" : "Lookup"}
        </Button>
      </div>

      {userPerms && (
        <div>
          <h2 className={styles.sectionTitle}>Permissions for {userId}</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHead}>Permission</th>
                <th className={styles.tableHead}>Status</th>
                <th className={styles.tableHead}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_PERMISSIONS.map((perm) => {
                const hasIt = currentPermissions.includes(perm);
                return (
                  <tr key={perm} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellMonospace}`}>{perm}</td>
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.statusBadge} ${
                          hasIt ? styles.statusGranted : styles.statusNotGranted
                        }`}
                      >
                        {hasIt ? "Granted" : "Not granted"}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {hasIt ? (
                        <Button
                          variant="danger"
                          onClick={() => handleRevoke(perm)}
                          disabled={loading}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => handleGrant(perm)}
                          disabled={loading}
                        >
                          Grant
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ScreenView>
  );
}
