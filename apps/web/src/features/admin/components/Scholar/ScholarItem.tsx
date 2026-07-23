"use client";

import { X, Send, Film, ExternalLink, Pencil } from "lucide-react";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { type AdminScholarListItemDto, COUNTRY_NAMES } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import { formatScholarName } from "@/shared/utils/format-scholar-name";
import styles from "./scholar-item.module.css";

export interface ScholarItemProps {
  scholar: AdminScholarListItemDto;
  onEdit: () => void;
}

function ScholarDetails({
  scholar,
  isMobile,
}: {
  scholar: AdminScholarListItemDto;
  isMobile: boolean;
}) {
  const countryName = scholar.country
    ? (COUNTRY_NAMES[scholar.country as keyof typeof COUNTRY_NAMES] ?? scholar.country)
    : null;

  return (
    <div className={styles.details}>
      <div className={styles.avatarBlock}>
        <UserAvatar
          image={scholar.imageUrl ?? null}
          name={scholar.name}
          size={isMobile ? 48 : 56}
        />
      </div>
      <div className={styles.detailsBody}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{formatScholarName(scholar)}</h3>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.slug}>{scholar.slug}</span>
          {countryName && (
            <>
              <span className={styles.sep}>&bull;</span>
              <span className={styles.country}>{isMobile ? scholar.country : countryName}</span>
            </>
          )}
        </div>
        {scholar.translations.length > 0 && (
          <div className={styles.translationRow}>
            {scholar.translations.map((t) => (
              <span key={t.locale} className={styles.translationChip}>
                {t.locale}
                <span
                  className={`${styles.translationDot} ${
                    t.status === "published" ? styles.dotPublished : styles.dotDraft
                  }`}
                />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScholarMeta({ scholar }: { scholar: AdminScholarListItemDto }) {
  const hasSocials =
    scholar.socialTwitter ||
    scholar.socialTelegram ||
    scholar.socialYoutube ||
    scholar.socialWebsite;

  if (!hasSocials && !scholar.bio) {
    return null;
  }
  return (
    <div className={styles.meta}>
      {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}
      {hasSocials && (
        <div className={styles.socialRow}>
          {scholar.socialTwitter && (
            <a
              href={scholar.socialTwitter}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="Twitter"
              aria-label="Twitter"
            >
              <X size={14} />
            </a>
          )}
          {scholar.socialTelegram && (
            <a
              href={scholar.socialTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="Telegram"
              aria-label="Telegram"
            >
              <Send size={14} />
            </a>
          )}
          {scholar.socialYoutube && (
            <a
              href={scholar.socialYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="YouTube"
              aria-label="YouTube"
            >
              <Film size={14} />
            </a>
          )}
          {scholar.socialWebsite && (
            <a
              href={scholar.socialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="Website"
              aria-label="Website"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function ScholarItem({ scholar, onEdit }: ScholarItemProps) {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  return (
    <List.Item interactive className={styles.listItem}>
      <div className={styles.content}>
        <ScholarDetails scholar={scholar} isMobile={isMobile} />
        <ScholarMeta scholar={scholar} />
      </div>
      <List.Item.Actions>
        <PermissionGate requires="SCHOLARS_EDIT">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onEdit}
            icon={<Pencil size={16} />}
            aria-label={`Edit ${scholar.name}`}
          >
            {isMobile && t("common.edit", "Edit")}
          </Button>
        </PermissionGate>
      </List.Item.Actions>
    </List.Item>
  );
}
