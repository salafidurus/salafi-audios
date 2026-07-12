import { Pencil } from "lucide-react";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/UserAvatar";
import styles from "./scholar-item.module.css";

export interface ScholarItemProps {
  id: string;
  name: string;
  slug: string;
  isKibar: boolean;
  lectureCount: number;
  imageUrl?: string;
  onEdit: () => void;
}

export function ScholarItem({
  name,
  slug,
  isKibar,
  lectureCount,
  imageUrl,
  onEdit,
}: ScholarItemProps) {
  return (
    <List.Item interactive className={styles.card}>
      <div className={styles.avatar}>
        <UserAvatar image={imageUrl ?? null} name={name} size={48} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.slug}>{slug}</p>
        <div className={styles.meta}>
          {isKibar && <span className={styles.badge}>Kibar</span>}
          <span className={styles.lectures}>{lectureCount} lectures</span>
        </div>
      </div>
      <List.Item.Actions>
        <PermissionGate requires="SCHOLARS_EDIT">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
            icon={<Pencil size={16} />}
          />
        </PermissionGate>
      </List.Item.Actions>
    </List.Item>
  );
}
