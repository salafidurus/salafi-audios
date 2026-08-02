"use client";

import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type AdminScholarListDto,
  type ScholarPermissionType,
  type UserScholarRoleDto,
} from "@sd/core-contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useState, type ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  fetchUserScholarRoles,
  grantScholarRole,
  revokeScholarRole,
  type AdminScholarRolesListResponse,
} from "@/features/admin/api/admin.api";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal/Modal";

import styles from "./ScholarRolesDialog.module.css";

export interface ScholarRolesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScholarRolesChange?: () => void;
  userId: string;
  userName?: string;
}

interface State {
  scholarRoles: AdminScholarRolesListResponse | null;
  loading: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AdminScholarRolesListResponse }
  | { type: "LOAD_ERROR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return { ...state, scholarRoles: action.payload, loading: false };
    case "LOAD_ERROR":
      return { ...state, scholarRoles: { scholarRoles: [] }, loading: false };
    default:
      return state;
  }
}

const PERMISSION_TYPES: ScholarPermissionType[] = ["OWN_CONTENT", "ASSIGNED_EDITOR"];

export function ScholarRolesDialog({
  isOpen,
  onClose,
  onScholarRolesChange,
  userId,
  userName = userId,
}: ScholarRolesDialogProps): ReactNode {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, { scholarRoles: null, loading: false });
  const [selectedScholarSlug, setSelectedScholarSlug] = useState("");
  const [selectedPermissionType, setSelectedPermissionType] =
    useState<ScholarPermissionType>("OWN_CONTENT");
  const [saving, setSaving] = useState(false);

  const { data: scholarsData } = useApiQuery<AdminScholarListDto>(
    [...queryKeys.admin.scholars.all(), "picker"],
    () => httpClient<AdminScholarListDto>({ url: endpoints.admin.scholars.list, method: "GET" }),
    { enabled: isOpen },
  );
  const scholars = scholarsData?.items ?? [];

  const reload = useCallback(() => {
    dispatch({ type: "LOAD_START" });
    fetchUserScholarRoles(userId)
      .then((data) => dispatch({ type: "LOAD_SUCCESS", payload: data }))
      .catch(() => dispatch({ type: "LOAD_ERROR" }));
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    reload();
  }, [isOpen, reload]);

  const effectiveScholarSlug = selectedScholarSlug || scholars[0]?.slug || "";

  const handleGrant = async () => {
    if (!effectiveScholarSlug) return;
    setSaving(true);
    try {
      await grantScholarRole(userId, effectiveScholarSlug, selectedPermissionType);
      reload();
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      onScholarRolesChange?.();
    } catch (error) {
      console.error("Failed to grant scholar role", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (role: UserScholarRoleDto) => {
    setSaving(true);
    try {
      await revokeScholarRole(userId, role.scholarSlug, role.permissionType);
      reload();
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      onScholarRolesChange?.();
    } catch (error) {
      console.error("Failed to revoke scholar role", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const customTitle = (
    <div className={styles.titleContainer}>
      <span className={styles.titleMain}>
        {t("admin.permissions.manageScholarAccess", "Scholar Access")}
      </span>
      <span className={styles.titleSub}>{userName}</span>
    </div>
  );

  const currentRoles = state.scholarRoles?.scholarRoles ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customTitle as any}
      width="standard"
      height="auto"
      footer={
        <Button variant="primary" onClick={onClose} disabled={saving}>
          {t("admin.permissions.done", "Done")}
        </Button>
      }
    >
      <div className={styles.addRow}>
        <select
          className={styles.select}
          value={effectiveScholarSlug}
          onChange={(e) => setSelectedScholarSlug(e.target.value)}
          aria-label={t("admin.permissions.scholarLabel", "Scholar")}
        >
          {scholars.map((scholar) => (
            <option key={scholar.id} value={scholar.slug}>
              {scholar.name}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={selectedPermissionType}
          onChange={(e) => setSelectedPermissionType(e.target.value as ScholarPermissionType)}
          aria-label={t("admin.permissions.permissionTypeLabel", "Access type")}
        >
          {PERMISSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "OWN_CONTENT"
                ? t("admin.permissions.ownContent", "Own Content (full control)")
                : t("admin.permissions.assignedEditor", "Assigned Editor (edit only)")}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={handleGrant} disabled={saving || !effectiveScholarSlug}>
          {t("admin.permissions.add", "Add")}
        </Button>
      </div>

      {state.loading && !state.scholarRoles ? (
        <div className={styles.loading}>
          {t("admin.permissions.loadingScholarRoles", "Loading scholar access…")}
        </div>
      ) : currentRoles.length === 0 ? (
        <div className={styles.empty}>
          {t("admin.permissions.noScholarRoles", "No scholar-scoped access granted yet.")}
        </div>
      ) : (
        <div className={styles.list}>
          {currentRoles.map((role) => (
            <div key={role.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{role.scholarName}</span>
                <span className={styles.itemDetail}>{role.permissionType}</span>
              </div>
              <Button variant="danger" onClick={() => handleRevoke(role)} disabled={saving}>
                {t("admin.permissions.revoke", "Revoke")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
