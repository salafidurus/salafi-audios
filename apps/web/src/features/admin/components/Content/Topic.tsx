import type { TopicDetailDto } from "@sd/core-contracts";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { Trash2 } from "lucide-react";
import styles from "./Content.module.css";

interface TopicProps {
  topic: TopicDetailDto;
  onEdit: (topic: TopicDetailDto) => void;
  onDelete: (slug: string, name: string) => void;
}

export function Topic({ topic, onEdit, onDelete }: TopicProps) {
  return (
    <List.Item interactive className={styles.topicItem}>
      <div className={styles.topicInfo}>
        <span className={styles.topicName}>{topic.name.en}</span>
        <span className={styles.topicSlug}>{topic.slug}</span>
      </div>
      <div className={styles.topicActions}>
        <PermissionGate requires="TOPICS_EDIT">
          <Button variant="ghost" size="sm" onClick={() => onEdit(topic)}>
            Edit
          </Button>
        </PermissionGate>
        <PermissionGate requires="TOPICS_DELETE">
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => onDelete(topic.slug, topic.name.en)}
          />
        </PermissionGate>
      </div>
    </List.Item>
  );
}
