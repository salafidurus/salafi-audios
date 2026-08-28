"use client";

import { subject } from "@casl/ability";
import { type AdminScholarListItemDto, COUNTRY_NAMES } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { X, Send, Film, ExternalLink, Pencil, Languages } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { Button } from "@/shared/components/ui/button";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./scholar-item.module.css";

export interface ScholarItemProps {
  scholar: AdminScholarListItemDto;
  onEdit: () => void;
  onTranslate?: () => void;
}

type ScholarSocialsProps = Pick<
  AdminScholarListItemDto,
  "socialTwitter" | "socialTelegram" | "socialYoutube" | "socialWebsite"
>;

function ScholarSocials({
  socialTwitter,
  socialTelegram,
  socialYoutube,
  socialWebsite,
}: ScholarSocialsProps) {
  const links = [
    { href: socialTwitter, label: "Twitter", icon: <X size={14} /> },
    { href: socialTelegram, label: "Telegram", icon: <Send size={14} /> },
    { href: socialYoutube, label: "YouTube", icon: <Film size={14} /> },
    { href: socialWebsite, label: "Website", icon: <ExternalLink size={14} /> },
  ];
  const visibleLinks = links.filter((link) => link.href);
  if (visibleLinks.length === 0) return null;
  return (
    <div className={styles.socialRow}>
      {visibleLinks.map((link) => (
        <a
          key={link.label}
          href={link.href ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
          title={link.label}
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

type ScholarItemActionsProps = {
  isMobile: boolean;
  canEdit: boolean;
  canTranslate: boolean;
  scholarName: string;
  onEdit: () => void;
  onTranslate?: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ScholarItemActions({
  isMobile,
  canEdit,
  canTranslate,
  scholarName,
  onEdit,
  onTranslate,
  t,
}: ScholarItemActionsProps) {
  const buttonProps = {
    variant: isMobile ? ("outline" as const) : ("ghost" as const),
    size: isMobile ? ("sm" as const) : ("icon" as const),
    fullWidth: isMobile,
  };
  return (
    <List.Item.Actions>
      {canEdit && (
        <Button
          {...buttonProps}
          onClick={onEdit}
          icon={<Pencil size={16} />}
          aria-label={`Edit ${scholarName}`}
        >
          {isMobile && t("common.edit", "Edit")}
        </Button>
      )}
      {canTranslate && (
        <Button
          {...buttonProps}
          onClick={onTranslate}
          icon={<Languages size={16} />}
          aria-label={`Translate ${scholarName}`}
        >
          {isMobile && t("admin.translations.button", "Translations")}
        </Button>
      )}
    </List.Item.Actions>
  );
}

function ScholarCountry({
  country,
  countryName,
  isMobile,
}: {
  country?: string | null;
  countryName: string | null;
  isMobile: boolean;
}) {
  if (!countryName) return null;
  return (
    <>
      <span className={styles.sep}>&bull;</span>
      <span className={styles.country}>{isMobile ? country : countryName}</span>
    </>
  );
}

export function ScholarItem({ scholar, onEdit, onTranslate }: ScholarItemProps) {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { ability } = useAbility();
  const formatScholarName = useFormatScholarName();
  const countryName = scholar.country ? (COUNTRY_NAMES[scholar.country] ?? scholar.country) : null;

  return (
    <List.Item interactive className={styles.listItem}>
      <div className={styles.container}>
        <div className={styles.avatarBlock}>
          <UserAvatar image={scholar.imageUrl ?? null} name={scholar.name} fill />
        </div>
        <div className={styles.detailsBody}>
          <MarqueeText
            text={formatScholarName(scholar)}
            className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
          />
          <div className={styles.metaRow}>
            <span className={styles.slug}>{scholar.slug}</span>
            <ScholarCountry
              country={scholar.country}
              countryName={countryName}
              isMobile={isMobile}
            />
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
          {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}
          <ScholarSocials {...scholar} />
        </div>
      </div>
      <ScholarItemActions
        isMobile={isMobile}
        canEdit={ability.can("update", subject("Scholar", { slug: scholar.slug }))}
        canTranslate={ability.can("read", subject("Translation", { scholarSlug: scholar.slug }))}
        scholarName={scholar.name}
        onEdit={onEdit}
        onTranslate={onTranslate}
        t={t}
      />
    </List.Item>
  );
}
