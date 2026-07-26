import type { AdminListingListItemDto } from "@sd/core-contracts";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { Pencil, Upload, Languages } from "lucide-react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import styles from "../Content.module.css";

interface ListingProps {
  listing: AdminListingListItemDto;
  onEdit: (id: string) => void;
  onUpload?: (id: string) => void;
  onTranslate?: (id: string) => void;
}

export function Listing({ listing, onEdit, onUpload, onTranslate }: ListingProps) {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const formattedScholarName = useFormattedScholarName(listing.scholarName);

  const statusText = t(`admin.contents.listing.${listing.status}`, listing.status);

  return (
    <List.Item interactive>
      <div className={styles.listingInfo}>
        <span className={styles.listingTitle}>{listing.title}</span>
        <span className={styles.listingMeta}>
          {formattedScholarName} • {statusText}
        </span>
      </div>
      <List.Item.Actions>
        <PermissionGate requires="LISTINGS_EDIT">
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
        </PermissionGate>
        <PermissionGate requires="TRANSLATIONS_VIEW">
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
        </PermissionGate>
        <PermissionGate requires="MEDIA_UPLOAD">
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
        </PermissionGate>
      </List.Item.Actions>
    </List.Item>
  );
}
