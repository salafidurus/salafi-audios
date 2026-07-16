"use client";

import { useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { RevokePermissionConfirmModal } from "@/shared/components/RevokePermissionConfirmModal";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import styles from "./admin-permissions.screen.module.css";

export function AdminPermissionsScreen() {
  const { isMobile } = useResponsive();
  const [userId, setUserId] = useState("");
  const [userPerms, setUserPerms] = useState<AdminPermissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!userId.trim()) {
      return;
    }
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

  const handleRevokeClick = (permission: string) => {
    setPermissionToRevoke(permission);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!permissionToRevoke) {
      return;
    }
    setLoading(true);
    try {
      const data = await revokePermission(userId.trim(), permissionToRevoke);
      setUserPerms(data);
      setRevokeModalOpen(false);
      setPermissionToRevoke(null);
    } finally {
      setLoading(false);
    }
  };

  const currentPermissions = userPerms?.permissions.map((p) => p.permission) ?? [];

  return (
    <ScreenView>
      <RevokePermissionConfirmModal
        isOpen={revokeModalOpen}
        onClose={() => {
          setRevokeModalOpen(false);
          setPermissionToRevoke(null);
        }}
        onConfirm={handleConfirmRevoke}
        permissionName={permissionToRevoke ?? ""}
        userName={userId}
      />

      <PageHeader title={!isMobile ? "Manage Permissions" : "Permissions"} />

      <PermissionGate requires="USERS_GRANT_PERMISSIONS">
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
            {loading ? (!isMobile ? "Loading…" : "…") : "Lookup"}
          </Button>
        </div>

        {userPerms && !isMobile && (
          <h2 className={styles.sectionTitle}>Permissions for {userId}</h2>
        )}

        {userPerms && !isMobile ? (
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
                          onClick={() => handleRevokeClick(perm)}
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
        ) : userPerms ? (
          <>
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
                    <Button
                      variant="danger"
                      onClick={() => handleRevokeClick(perm)}
                      disabled={loading}
                    >
                      Revoke
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => handleGrant(perm)} disabled={loading}>
                      Grant
                    </Button>
                  )}
                </div>
              );
            })}
          </>
        ) : null}
      </PermissionGate>
    </ScreenView>
  );
}
