"use client";

import { useEffect, useReducer } from "react";
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

interface State {
  userPerms: AdminPermissionsListResponse | null;
  loading: boolean;
  errors: Record<string, string | null>;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AdminPermissionsListResponse }
  | { type: "LOAD_ERROR" }
  | { type: "SET_PERMS"; payload: AdminPermissionsListResponse }
  | { type: "SET_ERROR"; permission: string; message: string }
  | { type: "CLEAR_ERROR"; permission: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return { ...state, userPerms: action.payload, loading: false };
    case "LOAD_ERROR":
      return { ...state, userPerms: { permissions: [] }, loading: false };
    case "SET_PERMS":
      return { ...state, userPerms: action.payload, loading: false };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.permission]: action.message },
        loading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, errors: { ...state.errors, [action.permission]: null } };
    default:
      return state;
  }
}

const initialState: State = {
  userPerms: null,
  loading: false,
  errors: {},
};

export function PermissionsDialog({
  isOpen,
  onClose,
  onPermissionsChange,
  userId,
  userName = userId,
}: PermissionsDialogProps): ReactNode {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;

    dispatch({ type: "LOAD_START" });

    fetchUserPermissions(userId)
      .then((data) => dispatch({ type: "LOAD_SUCCESS", payload: data }))
      .catch(() => dispatch({ type: "LOAD_ERROR" }));
  }, [isOpen, userId]);

  const handleGrant = async (permission: AdminPermission) => {
    dispatch({ type: "LOAD_START" });
    dispatch({ type: "CLEAR_ERROR", permission });
    try {
      const data = await grantPermission(userId, permission);
      dispatch({ type: "SET_PERMS", payload: data });
      onPermissionsChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to grant permission";
      dispatch({ type: "SET_ERROR", permission, message });
    } finally {
      /* loading handled by the fetch completion */
    }
  };

  const handleRevoke = async (permission: AdminPermission) => {
    dispatch({ type: "LOAD_START" });
    dispatch({ type: "CLEAR_ERROR", permission });
    try {
      const data = await revokePermission(userId, permission);
      dispatch({ type: "SET_PERMS", payload: data });
      onPermissionsChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to revoke permission";
      dispatch({ type: "SET_ERROR", permission, message });
    } finally {
      /* loading handled by the fetch completion */
    }
  };

  const currentPermissions = state.userPerms?.permissions.map((p) => p.permission) ?? [];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Permissions — ${userName}`}>
      <div className={styles.container}>
        {state.loading && !state.userPerms ? (
          <div className={styles.loading}>Loading permissions…</div>
        ) : (
          <div className={styles.permissionsList}>
            {ADMIN_PERMISSIONS.map((perm) => {
              const hasIt = currentPermissions.includes(perm);
              const error = state.errors[perm];
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
                        disabled={state.loading}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGrant(perm)}
                        disabled={state.loading}
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
          <Button variant="outline" onClick={onClose} disabled={state.loading}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
