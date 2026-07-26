import type { TopicDetailDto } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { Pencil, Trash2, Languages, Folder } from "lucide-react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "../Content.module.css";

interface TopicProps {
  topic: TopicDetailDto;
  onEdit: (topic: TopicDetailDto) => void;
  onDelete: (slug: string, name: string) => void;
  onTranslate?: (topic: TopicDetailDto) => void;
}

export function Topic({ topic, onEdit, onDelete, onTranslate }: TopicProps) {
  const { isMobile } = useResponsive();
  const { i18n, t } = useTranslation();
  const displayName = getLocalizedName(topic.name, i18n.language);

  return (
    <List.Item interactive>
      <div className={styles.topicInfo}>
        <MarqueeText
          text={displayName}
          className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)]"
        />
        <MarqueeText
          text={topic.slug}
          className="text-[var(--content-muted)] [font-size:var(--typo-body-sm-font-size)]"
        />
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
        <PermissionGate requires="TRANSLATIONS_VIEW">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            icon={<Languages size={16} />}
            onClick={() => onTranslate?.(topic)}
            aria-label={`Translate ${displayName}`}
          >
            {isMobile && t("admin.translations.button", "Translations")}
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
