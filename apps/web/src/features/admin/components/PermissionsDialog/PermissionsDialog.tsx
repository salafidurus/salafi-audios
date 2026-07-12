"use client";

import { useEffect, useReducer, useState } from "react";
import type { ReactNode } from "react";
import {
  type Permission,
  PERMISSIONS_ARRAY,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
} from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { Toggle } from "@/shared/components/Toggle";
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
  const [pendingPermissions, setPendingPermissions] = useState<Set<Permission>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentPermissions = state.userPerms?.permissions.map((p) => p.permission) ?? [];

  useEffect(() => {
    if (!isOpen) return;

    dispatch({ type: "LOAD_START" });

    fetchUserPermissions(userId)
      .then((data) => {
        dispatch({ type: "LOAD_SUCCESS", payload: data });
        setPendingPermissions(new Set(data.permissions.map((p) => p.permission)));
      })
      .catch(() => dispatch({ type: "LOAD_ERROR" }));
  }, [isOpen, userId]);

  const handleToggle = (permission: Permission) => {
    setPendingPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      // Determine which permissions to grant and revoke
      const toGrant: Permission[] = [];
      const toRevoke: Permission[] = [];

      for (const perm of PERMISSIONS_ARRAY) {
        const hadIt = currentPermissions.includes(perm);
        const hasItNow = pendingPermissions.has(perm);

        if (!hadIt && hasItNow) {
          toGrant.push(perm);
        } else if (hadIt && !hasItNow) {
          toRevoke.push(perm);
        }
      }

      // Apply changes in parallel
      toGrant.forEach((perm) => dispatch({ type: "CLEAR_ERROR", permission: perm }));
      toRevoke.forEach((perm) => dispatch({ type: "CLEAR_ERROR", permission: perm }));

      await Promise.all([
        ...toGrant.map(async (perm) => {
          try {
            const data = await grantPermission(userId, perm);
            dispatch({ type: "SET_PERMS", payload: data });
          } catch (error) {
            const message = getErrorMessage(error, "Failed to grant permission");
            dispatch({ type: "SET_ERROR", permission: perm, message });
          }
        }),
        ...toRevoke.map(async (perm) => {
          try {
            const data = await revokePermission(userId, perm);
            dispatch({ type: "SET_PERMS", payload: data });
          } catch (error) {
            const message = getErrorMessage(error, "Failed to revoke permission");
            dispatch({ type: "SET_ERROR", permission: perm, message });
          }
        }),
      ]);

      onPermissionsChange?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Permissions — ${userName}`}
      footer={
        <Button variant="primary" onClick={handleDone} disabled={saving}>
          {saving ? "Saving…" : "Done"}
        </Button>
      }
    >
      {state.loading && !state.userPerms ? (
        <div className={styles.loading}>Loading permissions…</div>
      ) : (
        <div className={styles.permissionsList}>
          {PERMISSIONS_ARRAY.map((perm) => {
            const isPending = pendingPermissions.has(perm);
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
                <Toggle
                  checked={isPending}
                  onChange={() => handleToggle(perm)}
                  disabled={saving}
                  aria-label={`${isPending ? "Revoke" : "Grant"} ${PERMISSION_LABELS[perm]}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as Record<string, unknown>).message;
    if (typeof msg === "string") {
      return msg;
    }
  }
  return defaultMessage;
}
