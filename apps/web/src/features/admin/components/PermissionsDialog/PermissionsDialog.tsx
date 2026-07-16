"use client";

import { useEffect, useReducer, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  type AdminUserListDto,
  type Permission,
  PERMISSIONS_ARRAY,
} from "@sd/core-contracts";
import {
  fetchUserPermissions,
  grantPermission,
  revokePermission,
  type AdminPermissionsListResponse,
} from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { PermissionSection } from "./PermissionSection";
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

const SECTIONS = [
  {
    title: "Scholars Management",
    permissions: [
      "SCHOLARS_VIEW",
      "SCHOLARS_CREATE",
      "SCHOLARS_EDIT",
      "SCHOLARS_DELETE",
      "SCHOLARS_PUBLISH",
    ] as Permission[],
  },
  {
    title: "Listings Management",
    permissions: [
      "LISTINGS_VIEW",
      "LISTINGS_CREATE",
      "LISTINGS_EDIT",
      "LISTINGS_DELETE",
      "LISTINGS_PUBLISH",
    ] as Permission[],
  },
  {
    title: "Topics Management",
    permissions: [
      "TOPICS_VIEW",
      "TOPICS_CREATE",
      "TOPICS_EDIT",
      "TOPICS_DELETE",
      "TOPICS_PUBLISH",
    ] as Permission[],
  },
  {
    title: "Translations Management",
    permissions: [
      "TRANSLATIONS_VIEW",
      "TRANSLATIONS_CREATE",
      "TRANSLATIONS_EDIT",
      "TRANSLATIONS_DELETE",
      "TRANSLATIONS_PUBLISH",
    ] as Permission[],
  },
  {
    title: "Media Management",
    permissions: ["MEDIA_UPLOAD", "MEDIA_DELETE"] as Permission[],
  },
  {
    title: "User Management",
    permissions: [
      "USERS_VIEW",
      "USERS_EDIT",
      "USERS_DELETE",
      "USERS_GRANT_PERMISSIONS",
      "USERS_GRANT_ROLES",
    ] as Permission[],
  },
  {
    title: "Livestream Management",
    permissions: [
      "LIVE_VIEW",
      "LIVE_CREATE",
      "LIVE_EDIT",
      "LIVE_DELETE",
      "LIVE_START",
      "LIVE_STOP",
    ] as Permission[],
  },
];

export function PermissionsDialog({
  isOpen,
  onClose,
  onPermissionsChange,
  userId,
  userName = userId,
}: PermissionsDialogProps): ReactNode {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pendingPermissions, setPendingPermissions] = useState<Set<Permission>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentPermissions = state.userPerms?.permissions.map((p) => p.permission) ?? [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }
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

    // Optimistic Update
    const updatedPerms = Array.from(pendingPermissions);
    queryClient.setQueriesData<AdminUserListDto>(
      { queryKey: queryKeys.admin.users.all() },
      (oldData) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          users: oldData.users.map((u) =>
            u.id === userId ? { ...u, permissions: updatedPerms } : u,
          ),
        };
      },
    );

    // Call callback immediately to close or update parent view
    onPermissionsChange?.();
    onClose();

    // Fire API calls in background
    try {
      await Promise.all([
        ...toGrant.map(async (perm) => {
          try {
            await grantPermission(userId, perm);
          } catch (error) {
            console.error("Failed to grant permission:", perm, error);
          }
        }),
        ...toRevoke.map(async (perm) => {
          try {
            await revokePermission(userId, perm);
          } catch (error) {
            console.error("Failed to revoke permission:", perm, error);
          }
        }),
      ]);
    } catch (error) {
      console.error("Failed to complete batch permission updates", error);
    } finally {
      setSaving(false);
      // Re-fetch to ensure data integrity
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    }
  };

  if (!isOpen) {
    return null;
  }
  const customTitle = (
    <div className={styles.titleContainer}>
      <span className={styles.titleMain}>Manage Permissions</span>
      <span className={styles.titleSub}>{userName}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={customTitle as any}
      footer={
        <Button variant="primary" onClick={handleDone} disabled={saving}>
          {saving ? "Saving…" : "Done"}
        </Button>
      }
    >
      {state.loading && !state.userPerms ? (
        <div className={styles.loading}>Loading permissions…</div>
      ) : (
        <div className={styles.sectionsGrid}>
          {SECTIONS.map((section) => (
            <PermissionSection
              key={section.title}
              title={section.title}
              permissions={section.permissions}
              pendingPermissions={pendingPermissions}
              errors={state.errors}
              saving={saving}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
