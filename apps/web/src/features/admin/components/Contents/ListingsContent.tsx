"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, type AdminListingDetailDto } from "@sd/core-contracts";
import { useInfiniteAdminListings } from "@sd/domain-content";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { useTranslation } from "@/core/i18n/use-translation";
import { Content } from "../Content";
import { AudioUploader } from "../AudioUploader/AudioUploader";
import { fetchAdminLectureDetail } from "../../api/admin-lectures.api";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

export type ListingsContentProps = {
  debouncedSearch: string;
};

export function ListingsContent({ debouncedSearch }: ListingsContentProps) {
  const { t } = useTranslation();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteAdminListings({
      search: debouncedSearch,
    });

  const [isAudioUploaderOpen, setIsAudioUploaderOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListingDetailDto | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<AudioData | null>(null);
  const queryClient = useQueryClient();

  const allListings = data?.pages.flatMap((page) => page.items) ?? [];

  const handleUploadComplete = (audioInfo: AudioData | null) => {
    setInitialAudioData(audioInfo);
    setSelectedListing(null);
    setIsAudioUploaderOpen(false);
    setIsListingModalOpen(true);
  };

  const handleEditListing = async (listingId: string) => {
    try {
      const details = await fetchAdminLectureDetail(listingId);
      setSelectedListing(details);
      setInitialAudioData(null);
      setIsListingModalOpen(true);
    } catch {
      // Stay on current view
    }
  };

  const handleListingSaved = () => {
    setIsListingModalOpen(false);
    setSelectedListing(null);
    setInitialAudioData(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.listings.infinite() });
  };

  return (
    <>
      <InfiniteScrollList
        data={allListings}
        isLoading={isLoading}
        hasMore={hasNextPage ?? false}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(listing) => (
          <Content.Listing key={listing.id} listing={listing} onEdit={handleEditListing} />
        )}
        emptyMessage={
          debouncedSearch
            ? t("admin.contents.searchNoMatchListings", "No listings match your search.")
            : t("admin.contents.noListingsFound", "No listings yet. Add audio to create a listing.")
        }
      />

      {isAudioUploaderOpen && <AudioUploader onUploadComplete={handleUploadComplete} />}

      <Content.ListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSuccess={handleListingSaved}
        listing={selectedListing}
        initialAudioData={initialAudioData}
      />
    </>
  );
}
