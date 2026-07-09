"use client";

import { useEffect, useState } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import styles from "./PermissionsDialog.module.css";

export interface PermissionsDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Callback to close dialog */
  onClose: () => void;
  /** User ID for which to manage permissions */
  userId: string;
  /** User display name (for header) */
  userName?: string;
}

export function PermissionsDialog({
  isOpen,
  onClose,
  userId,
  userName = userId,
}: PermissionsDialogProps) {
  const [userPerms, setUserPerms] = useState<AdminPermissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Load permissions when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const loadPermissions = async () => {
      setLoading(true);
      try {
        const data = await fetchUserPermissions(userId);
        setUserPerms(data);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        setUserPerms({ permissions: [] });
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [isOpen, userId]);

  const handleGrant = async (permission: AdminPermission) => {
    setLoading(true);
    try {
      const data = await grantPermission(userId, permission);
      setUserPerms(data);
    } catch (error) {
      console.error("Failed to grant permission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permission: string) => {
    setLoading(true);
    try {
      const data = await revokePermission(userId, permission);
      setUserPerms(data);
    } catch (error) {
      console.error("Failed to revoke permission:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPermissions = userPerms?.permissions.map((p) => p.permission) ?? [];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Permissions - ${userName}`}>
      <div className={styles.container}>
        {loading && !userPerms ? (
          <div className={styles.loading}>Loading permissions…</div>
        ) : (
          <div className={styles.permissionsList}>
            {ADMIN_PERMISSIONS.map((perm) => {
              const hasIt = currentPermissions.includes(perm);
              return (
                <div key={perm} className={styles.permissionItem}>
                  <div className={styles.permissionInfo}>
                    <code className={styles.permissionName}>{perm}</code>
                    <span
                      className={`${styles.permissionStatus} ${
                        hasIt ? styles.statusGranted : styles.statusNotGranted
                      }`}
                    >
                      {hasIt ? "Granted" : "Not granted"}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    {hasIt ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevoke(perm)}
                        disabled={loading}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGrant(perm)}
                        disabled={loading}
                      >
                        Grant
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
