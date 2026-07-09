"use client";

import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ADMIN_PERMISSIONS, type AdminPermission } from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/features/admin/constants/permissions";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import styles from "./PermissionsDialog.module.css";

export interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsChange?: () => void;
  userId: string;
  userName?: string;
}

export function PermissionsDialog({
  isOpen,
  onClose,
  onPermissionsChange,
  userId,
  userName = userId,
}: PermissionsDialogProps): ReactNode {
  const [userPerms, setUserPerms] = useState<AdminPermissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUserPermissions(userId);
      setUserPerms(data);
    } catch {
      setUserPerms({ permissions: [] });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    loadPermissions();
  }, [isOpen, loadPermissions]);

  const handleGrant = async (permission: AdminPermission) => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, [permission]: null }));
    try {
      const data = await grantPermission(userId, permission);
      setUserPerms(data);
      onPermissionsChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to grant permission";
      setErrors((prev) => ({ ...prev, [permission]: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permission: AdminPermission) => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, [permission]: null }));
    try {
      const data = await revokePermission(userId, permission);
      setUserPerms(data);
      onPermissionsChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to revoke permission";
      setErrors((prev) => ({ ...prev, [permission]: message }));
    } finally {
      setLoading(false);
    }
  };

  const currentPermissions = userPerms?.permissions.map((p) => p.permission) ?? [];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Permissions — ${userName}`}>
      <div className={styles.container}>
        {loading && !userPerms ? (
          <div className={styles.loading}>Loading permissions…</div>
        ) : (
          <div className={styles.permissionsList}>
            {ADMIN_PERMISSIONS.map((perm) => {
              const hasIt = currentPermissions.includes(perm);
              const error = errors[perm];
              return (
                <div key={perm} className={styles.permissionItem}>
                  <div className={styles.permissionInfo}>
                    <span className={styles.permissionName}>{PERMISSION_LABELS[perm]}</span>
                    <span className={styles.permissionDescription}>
                      {PERMISSION_DESCRIPTIONS[perm]}
                    </span>
                    {error && <span className={styles.error}>{error}</span>}
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
