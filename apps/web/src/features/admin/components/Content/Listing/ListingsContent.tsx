"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@sd/core-contracts";
import { useInfiniteAdminListings } from "@sd/domain-content";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { useTranslation } from "@/core/i18n/use-translation";
import { Content } from "../Content";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

export type ListingsContentProps = {
  debouncedSearch: string;
  isAudioUploaderOpen: boolean;
  onAudioUploaderOpenChange: (open: boolean) => void;
};

export function ListingsContent({
  debouncedSearch,
  isAudioUploaderOpen,
  onAudioUploaderOpenChange,
}: ListingsContentProps) {
  const { t } = useTranslation();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteAdminListings({
      search: debouncedSearch,
    });

  const setIsAudioUploaderOpen = onAudioUploaderOpenChange;
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<AudioData | null>(null);
  const queryClient = useQueryClient();

  const allListings = data?.pages.flatMap((page) => page.items) ?? [];

  const handleUploadComplete = (audioInfo: AudioData | null) => {
    setInitialAudioData(audioInfo);
    setSelectedListingId(null);
    setIsAudioUploaderOpen(false);
    setIsListingModalOpen(true);
  };

  const handleEditListing = (listingId: string) => {
    setSelectedListingId(listingId);
    setInitialAudioData(null);
    setIsListingModalOpen(true);
  };

  const handleListingSaved = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.listings.infinite() });
    setIsListingModalOpen(false);
    setSelectedListingId(null);
    setInitialAudioData(null);
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

      <Content.ListingModal
        isOpen={isListingModalOpen || isAudioUploaderOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setIsAudioUploaderOpen(false);
        }}
        onSuccess={handleListingSaved}
        listingId={selectedListingId}
        initialAudioData={initialAudioData}
        showAudioUploadTab={isAudioUploaderOpen && !selectedListingId}
        onAudioUploadComplete={handleUploadComplete}
      />
    </>
  );
}
