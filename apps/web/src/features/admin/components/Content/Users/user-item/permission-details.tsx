import type { ReactNode } from "react";
import type { AdminPermission } from "@sd/core-contracts";
import { ShieldOff } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import { PermissionBadge } from "../permission-badge/permission-badge";
import styles from "./permission-details.module.css";

type PermissionDetailsProps = {
  permissions: { permission: AdminPermission }[];
};

const GROUPS = [
  { key: "SCHOLARS", label: "Scholars", prefix: "SCHOLARS_" },
  { key: "LISTINGS", label: "Listings", prefix: "LISTINGS_" },
  { key: "TOPICS", label: "Topics", prefix: "TOPICS_" },
  { key: "TRANSLATIONS", label: "Translations", prefix: "TRANSLATIONS_" },
  { key: "MEDIA", label: "Media", prefix: "MEDIA_" },
  { key: "USERS", label: "Users", prefix: "USERS_" },
  { key: "LIVE", label: "Livestreams", prefix: "LIVE_" },
] as const;

export function PermissionDetails({ permissions }: PermissionDetailsProps): ReactNode {
  const { t } = useTranslation();

  if (permissions.length === 0) {
    return (
      <div className={styles.noPerms}>
        <ShieldOff className={styles.noPermsIcon} />
        <span>{t("admin.permissions.noPermissions", "No permissions")}</span>
      </div>
    );
  }

  const userPermList = permissions.map((p) => p.permission);

  return (
    <div className={styles.container}>
      {GROUPS.map((group) => {
        const groupPerms = userPermList.filter((perm) => perm.startsWith(group.prefix));
        if (groupPerms.length === 0) {
          return null;
        }
        const groupLabel = t(`admin.permissions.groups.${group.key.toLowerCase()}`, group.label);
        return (
          <div key={group.key} className={styles.groupRow}>
            <span className={styles.groupLabel}>{groupLabel}:</span>
            <div className={styles.badges}>
              {groupPerms.map((perm) => (
                <PermissionBadge key={perm} permission={perm} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
