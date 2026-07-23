import type { TopicDetailDto } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { Pencil, Trash2 } from "lucide-react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "../Content.module.css";

interface TopicProps {
  topic: TopicDetailDto;
  onEdit: (topic: TopicDetailDto) => void;
  onDelete: (slug: string, name: string) => void;
}

export function Topic({ topic, onEdit, onDelete }: TopicProps) {
  const { isMobile } = useResponsive();
  const { i18n, t } = useTranslation();
  const displayName = getLocalizedName(topic.name, i18n.language);

  return (
    <List.Item interactive>
      <div className={styles.topicInfo}>
        <span className={styles.topicName}>{displayName}</span>
        <span className={styles.topicSlug}>{topic.slug}</span>
      </div>
      <List.Item.Actions>
        <PermissionGate requires="TOPICS_EDIT">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            icon={<Pencil size={16} />}
            onClick={() => onEdit(topic)}
            aria-label={`Edit topic ${displayName}`}
          >
            {isMobile && t("common.edit", "Edit")}
          </Button>
        </PermissionGate>
        <PermissionGate requires="TOPICS_DELETE">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(topic.slug, displayName)}
            aria-label={`Delete topic ${displayName}`}
          >
            {isMobile && t("common.delete", "Delete")}
          </Button>
        </PermissionGate>
      </List.Item.Actions>
    </List.Item>
  );
}
