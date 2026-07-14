import { ListingEditModal } from "@/features/admin/components/ListingEditModal/ListingEditModal";
import type { AdminListingDetailDto } from "@sd/core-contracts";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listing?: AdminListingDetailDto | null;
  initialAudioData?: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  } | null;
}

export function ListingModal({ listing, ...props }: ListingModalProps) {
  return <ListingEditModal listing={listing} {...props} />;
}
