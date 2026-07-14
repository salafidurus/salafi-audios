import type { AdminListingListItemDto } from "@sd/core-contracts";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { Edit } from "lucide-react";
import styles from "./Content.module.css";

interface ListingProps {
  listing: AdminListingListItemDto;
  onEdit: (id: string) => void;
}

export function Listing({ listing, onEdit }: ListingProps) {
  return (
    <List.Item interactive className={styles.listingItem}>
      <div className={styles.listingInfo}>
        <span className={styles.listingTitle}>{listing.title}</span>
        <span className={styles.listingMeta}>
          {listing.scholarName} • {listing.status}
        </span>
      </div>
      <div className={styles.listingActions}>
        <PermissionGate requires="LISTINGS_EDIT">
          <Button variant="ghost" size="sm" onClick={() => onEdit(listing.id)}>
            <Edit size={14} />
          </Button>
        </PermissionGate>
      </div>
    </List.Item>
  );
}
