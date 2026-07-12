"use client";

import { useEffect, useReducer, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "@sd/core-contracts";
import {
  fetchUserRoles,
  grantRole,
  revokeRole,
  type AdminRolesListResponse,
} from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { Toggle } from "@/shared/components/Toggle";
import styles from "./RoleDialog.module.css";

export interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRolesChange?: () => void;
  userId: string;
  userName?: string;
}

// Role labels matching ROLE_CHIPS
const ROLE_LABELS: Record<UserRole, string> = {
  listener: "Listener",
  scholar: "Scholar",
  translator: "Translator",
  editor: "Editor",
  admin: "Admin",
  superadmin: "Super Admin",
};

// Available roles in order
const ROLES_ARRAY: UserRole[] = [
  "listener",
  "scholar",
  "translator",
  "editor",
  "admin",
  "superadmin",
];

// Role descriptions
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  listener: "Regular user who listens to lectures",
  scholar: "Content creator who manages their own lectures",
  translator: "Translates content to assigned languages",
  editor: "Manages content for assigned scholars",
  admin: "Platform administrator with elevated permissions",
  superadmin: "Full system access and override permissions",
};

interface State {
  userRoles: AdminRolesListResponse | null;
  loading: boolean;
  errors: Record<string, string | null>;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AdminRolesListResponse }
  | { type: "LOAD_ERROR" }
  | { type: "SET_ROLES"; payload: AdminRolesListResponse }
  | { type: "SET_ERROR"; role: string; message: string }
  | { type: "CLEAR_ERROR"; role: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return { ...state, userRoles: action.payload, loading: false };
    case "LOAD_ERROR":
      return { ...state, userRoles: { roles: [] }, loading: false };
    case "SET_ROLES":
      return { ...state, userRoles: action.payload, loading: false };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.role]: action.message },
        loading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, errors: { ...state.errors, [action.role]: null } };
    default:
      return state;
  }
}

const initialState: State = {
  userRoles: null,
  loading: false,
  errors: {},
};

export function RoleDialog({
  isOpen,
  onClose,
  onRolesChange,
  userId,
  userName = userId,
}: RoleDialogProps): ReactNode {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pendingRoles, setPendingRoles] = useState<Set<UserRole>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentRoles = state.userRoles?.roles.map((r) => r.role) ?? [];

  useEffect(() => {
    if (!isOpen) return;

    dispatch({ type: "LOAD_START" });

    fetchUserRoles(userId)
      .then((data) => {
        dispatch({ type: "LOAD_SUCCESS", payload: data });
        setPendingRoles(new Set(data.roles.map((r) => r.role)));
      })
      .catch(() => dispatch({ type: "LOAD_ERROR" }));
  }, [isOpen, userId]);

  const handleToggle = (role: UserRole) => {
    setPendingRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      // Determine which roles to grant and revoke
      const toGrant: UserRole[] = [];
      const toRevoke: UserRole[] = [];

      for (const role of ROLES_ARRAY) {
        const hadIt = currentRoles.includes(role);
        const hasItNow = pendingRoles.has(role);

        if (!hadIt && hasItNow) {
          toGrant.push(role);
        } else if (hadIt && !hasItNow) {
          toRevoke.push(role);
        }
      }

      // Apply changes in parallel
      toGrant.forEach((role) => dispatch({ type: "CLEAR_ERROR", role }));
      toRevoke.forEach((role) => dispatch({ type: "CLEAR_ERROR", role }));

      await Promise.all([
        ...toGrant.map(async (role) => {
          try {
            const data = await grantRole(userId, role);
            dispatch({ type: "SET_ROLES", payload: data });
          } catch (error) {
            const message = getErrorMessage(error, "Failed to grant role");
            dispatch({ type: "SET_ERROR", role, message });
          }
        }),
        ...toRevoke.map(async (role) => {
          try {
            const data = await revokeRole(userId, role);
            dispatch({ type: "SET_ROLES", payload: data });
          } catch (error) {
            const message = getErrorMessage(error, "Failed to revoke role");
            dispatch({ type: "SET_ERROR", role, message });
          }
        }),
      ]);

      onRolesChange?.();
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
      title={`Manage Roles — ${userName}`}
      footer={
        <Button variant="primary" onClick={handleDone} disabled={saving}>
          {saving ? "Saving…" : "Done"}
        </Button>
      }
    >
      {state.loading && !state.userRoles ? (
        <div className={styles.loading}>Loading roles…</div>
      ) : (
        <div className={styles.rolesList}>
          {ROLES_ARRAY.map((role) => {
            const isPending = pendingRoles.has(role);
            const error = state.errors[role];
            return (
              <div key={role} className={styles.roleItem}>
                <div className={styles.roleInfo}>
                  <span className={styles.roleName}>{ROLE_LABELS[role]}</span>
                  <span className={styles.roleDescription}>{ROLE_DESCRIPTIONS[role]}</span>
                  {error && <span className={styles.error}>{error}</span>}
                </div>
                <Toggle
                  checked={isPending}
                  onChange={() => handleToggle(role)}
                  disabled={saving}
                  aria-label={`${isPending ? "Revoke" : "Grant"} ${ROLE_LABELS[role]}`}
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
