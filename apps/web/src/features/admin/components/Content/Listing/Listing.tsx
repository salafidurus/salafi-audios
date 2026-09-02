import type { AdminListingListItemDto } from "@sd/core-contracts";

import { useAbility } from "@sd/domain-account";
import { Pencil, Upload, Languages, Headphones } from "lucide-react";
import Image from "next/image";

import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { Button } from "@/shared/components/ui/button";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "../Content.module.css";

/** Documents this module's responsibility and public boundary. */
interface ListingProps {
  listing: AdminListingListItemDto;
  onEdit: (id: string) => void;
  onUpload?: (id: string) => void;
  onTranslate?: (id: string) => void;
}

function ListingActions({
  listing,
  variant,
  permissions,
  onEdit,
  onUpload,
  onTranslate,
}: ListingProps & {
  variant: "outline" | "ghost";
  permissions: { update: boolean; translate: boolean; upload: boolean };
}) {
  return (
    <List.Item.Actions mobileOrientation="horizontal" className={styles.mobileActions}>
      {permissions.update && (
        <Button
          variant={variant}
          size="icon"
          icon={<Pencil size={16} />}
          onClick={() => onEdit(listing.id)}
          aria-label={`Edit ${listing.title}`}
        />
      )}
      {permissions.translate && (
        <Button
          variant={variant}
          size="icon"
          icon={<Languages size={16} />}
          onClick={() => onTranslate?.(listing.id)}
          aria-label={`Translate ${listing.title}`}
        />
      )}
      {permissions.upload && (
        <Button
          variant={variant}
          size="icon"
          icon={<Upload size={16} />}
          onClick={() => onUpload?.(listing.id)}
          aria-label={`Upload ${listing.title}`}
        />
      )}
    </List.Item.Actions>
  );
}

export function Listing({ listing, onEdit, onUpload, onTranslate }: ListingProps) {
  const { isMobile } = useResponsive();
  const { ability } = useAbility();
  const formattedScholarName = useFormattedScholarName(listing.scholarName, listing.scholarSlug);
  // Bare (unconditioned) checks: the list itself is already scope-filtered
  // server-side (a scholar-scoped editor only ever fetches their own
  // scholars' listings), so any row rendered here is already in scope.

  const coverImage = listing.coverImageUrl;

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
            text={formattedScholarName}
            className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
          />
        </div>
      </div>
      <ListingActions
        listing={listing}
        variant={isMobile ? "outline" : "ghost"}
        permissions={{
          update: ability.can("update", "Listing"),
          translate: ability.can("read", "Translation"),
          upload: ability.can("upload", "Media"),
        }}
        onEdit={onEdit}
        onUpload={onUpload}
        onTranslate={onTranslate}
      />
    </List.Item>
  );
}
