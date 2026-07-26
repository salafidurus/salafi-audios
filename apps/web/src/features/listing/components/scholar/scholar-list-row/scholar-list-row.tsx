"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import { formatScholarName } from "@/shared/utils/format-scholar-name";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/user-avatar";
import { MarqueeText } from "@/shared/components/MarqueeText";
import styles from "./scholar-list-row.module.css";

export type ScholarListRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarListRow({ scholar, onPress }: ScholarListRowProps) {
  const isRtl = useIsRtl();
  const formattedName = formatScholarName(scholar);

  const metaText = [
    scholar.mainLanguage ? scholar.mainLanguage.toUpperCase() : null,
    scholar.lectureCount ? `${scholar.lectureCount} lectures` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <List.Item interactive onClick={onPress ? () => onPress(scholar.slug) : undefined}>
      <div className={styles.container}>
        <div className={styles.avatarSection}>
          <UserAvatar image={scholar.imageUrl ?? null} name={scholar.name} fill />
        </div>

        <div className={styles.centerSection}>
          <MarqueeText
            text={formattedName}
            className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
          />
          {metaText && (
            <MarqueeText
              text={metaText}
              className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
            />
          )}
        </div>
      </div>

      {onPress && (
        <List.Item.Actions>
          <div className={styles.chevronWrapper}>
            {isRtl ? (
              <ChevronLeft className={styles.chevron} size={20} />
            ) : (
              <ChevronRight className={styles.chevron} size={20} />
            )}
          </div>
        </List.Item.Actions>
      )}
    </List.Item>
  );
}
