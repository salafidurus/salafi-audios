import type { TopicDetailDto } from "@sd/core-contracts";

import { getLocalizedName } from "@sd/core-i18n";
import { useAbility } from "@sd/domain-account";
import { Pencil, Trash2, Languages } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { useResponsive } from "@/shared/hooks/use-responsive";

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
  const { ability } = useAbility();
  const displayName = getLocalizedName(topic.name, i18n.language);

  return (
    <List.Item interactive>
      <div className={styles.topicInfo}>
        <MarqueeText
          text={displayName}
          className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
        />
        <MarqueeText
          text={topic.slug}
          className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
        />
      </div>
      <List.Item.Actions>
        {ability.can("update", "Topic") && (
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
        )}
        {ability.can("read", "Translation") && (
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
        )}
        {ability.can("delete", "Topic") && (
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
        )}
      </List.Item.Actions>
    </List.Item>
  );
}
