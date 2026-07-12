"use client";

import { useEffect, useReducer, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, type AdminUserListDto } from "@sd/core-contracts";
import type { UserRole } from "@sd/core-contracts";
import {
  fetchUserRoles,
  grantRole,
  revokeRole,
  type AdminRolesListResponse,
} from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { RoleItem } from "./RoleItem";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLES_ARRAY } from "./constants";
import styles from "./RoleDialog.module.css";

export interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRolesChange?: () => void;
  userId: string;
  userName?: string;
}

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
  const queryClient = useQueryClient();
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

    // Optimistic Update
    const updatedRoles = Array.from(pendingRoles);
    queryClient.setQueriesData<AdminUserListDto>(
      { queryKey: queryKeys.admin.users.all() },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: oldData.users.map((u) => (u.id === userId ? { ...u, roles: updatedRoles } : u)),
        };
      },
    );

    // Call callback immediately to close or update parent view
    onRolesChange?.();
    onClose();

    // Fire API calls in background
    try {
      await Promise.all([
        ...toGrant.map(async (role) => {
          try {
            await grantRole(userId, role);
          } catch (error) {
            console.error("Failed to grant role:", role, error);
          }
        }),
        ...toRevoke.map(async (role) => {
          try {
            await revokeRole(userId, role);
          } catch (error) {
            console.error("Failed to revoke role:", role, error);
          }
        }),
      ]);
    } catch (error) {
      console.error("Failed to complete batch role updates", error);
    } finally {
      setSaving(false);
      // Re-fetch to ensure data integrity
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    }
  };

  if (!isOpen) return null;

  const customTitle = (
    <div className={styles.titleContainer}>
      <span className={styles.titleMain}>Manage Roles</span>
      <span className={styles.titleSub}>{userName}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customTitle as any}
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
          {ROLES_ARRAY.map((role) => (
            <RoleItem
              key={role}
              role={role}
              isPending={pendingRoles.has(role)}
              error={state.errors[role] ?? null}
              saving={saving}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
