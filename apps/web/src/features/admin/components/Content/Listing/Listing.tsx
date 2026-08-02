import type { AdminListingListItemDto } from "@sd/core-contracts";

import { useAbility } from "@sd/domain-account";
import { Pencil, Upload, Languages, Headphones } from "lucide-react";
import Image from "next/image";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "../Content.module.css";

interface ListingProps {
  listing: AdminListingListItemDto & { coverUrl?: string | null; thumbnailUrl?: string | null };
  onEdit: (id: string) => void;
  onUpload?: (id: string) => void;
  onTranslate?: (id: string) => void;
}

export function Listing({ listing, onEdit, onUpload, onTranslate }: ListingProps) {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { ability } = useAbility();
  const formattedScholarName = useFormattedScholarName(listing.scholarName, listing.scholarSlug);
  // Bare (unconditioned) checks: the list itself is already scope-filtered
  // server-side (a scholar-scoped editor only ever fetches their own
  // scholars' listings), so any row rendered here is already in scope.

  const statusText = t(`admin.contents.listing.${listing.status}`, listing.status);
  const coverImage = listing.coverUrl || listing.thumbnailUrl;

  return (
    <List.Item interactive>
      <div className={styles.rowContainer}>
        <div className={styles.mediaCover}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 20vw, 14vw"
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.mediaFallback}>
              <Headphones size={20} style={{ color: "var(--content-subtle)" }} />
            </div>
          )}
        </div>
        <div className={styles.listingInfo}>
          <MarqueeText
            text={listing.title}
            className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
          />
          <MarqueeText
            text={`${formattedScholarName} • ${statusText}`}
            className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
          />
        </div>
      </div>
      <List.Item.Actions>
        {ability.can("update", "Listing") && (
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            icon={<Pencil size={16} />}
            onClick={() => onEdit(listing.id)}
            aria-label={`Edit ${listing.title}`}
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
            onClick={() => onTranslate?.(listing.id)}
            aria-label={`Translate ${listing.title}`}
          >
            {isMobile && t("admin.translations.button", "Translations")}
          </Button>
        )}
        {ability.can("upload", "Media") && (
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            icon={<Upload size={16} />}
            onClick={() => onUpload?.(listing.id)}
            aria-label={`Upload ${listing.title}`}
          >
            {isMobile && t("common.upload", "Upload")}
          </Button>
        )}
      </List.Item.Actions>
    </List.Item>
  );
}
