"use client";

import { queryKeys } from "@sd/core-contracts";
import { useInfiniteAdminListings } from "@sd/domain-content";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  TranslationModal,
  translationTargetKey,
  type ClientTranslationTarget,
} from "@/features/admin/components/Translation";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";

import { Content } from "../Content";

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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadListingId, setSelectedUploadListingId] = useState<string | null>(null);

  const [translationTarget, setTranslationTarget] = useState<ClientTranslationTarget | null>(null);

  const queryClient = useQueryClient();

  const allListings = data?.pages.flatMap((page) => page.items) ?? [];

  const handleEditListing = (listingId: string) => {
    setSelectedListingId(listingId);
    setIsListingModalOpen(true);
  };

  const handleUploadListing = (listingId: string) => {
    setSelectedUploadListingId(listingId);
    setIsUploadModalOpen(true);
  };

  const handleListingSaved = async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.admin.listings.all() });
    setIsListingModalOpen(false);
    setSelectedListingId(null);
  };

  const handleUploadSaved = async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.admin.listings.all() });
    setIsUploadModalOpen(false);
    setSelectedUploadListingId(null);
    setIsAudioUploaderOpen(false);
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
          <Content.Listing
            key={listing.id}
            listing={listing}
            onEdit={handleEditListing}
            onUpload={handleUploadListing}
            onTranslate={(id) => setTranslationTarget({ entity: "listing", listingId: id })}
          />
        )}
        emptyMessage={
          debouncedSearch
            ? t("admin.contents.searchNoMatchListings", "No listings match your search.")
            : t("admin.contents.noListingsFound", "No listings yet. Add a listing to get started.")
        }
      />

      <Content.ListingModal
        key={selectedListingId ?? "create"}
        isOpen={isListingModalOpen || isAudioUploaderOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setIsAudioUploaderOpen(false);
          setSelectedListingId(null);
        }}
        onSuccess={async () => {
          await handleListingSaved();
          setIsAudioUploaderOpen(false);
        }}
        listingId={selectedListingId}
      />

      <Content.ListingUploadArrangeModal
        key={selectedUploadListingId ?? "upload"}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          // Do NOT clear selectedUploadListingId here — that would remount the
          // component and destroy in-progress upload state on an accidental close.
          // The id is only cleared by handleUploadSaved (on successful commit).
        }}
        onSuccess={handleUploadSaved}
        listingId={selectedUploadListingId}
      />

      <TranslationModal
        key={translationTargetKey(translationTarget)}
        isOpen={!!translationTarget}
        target={translationTarget}
        onClose={() => setTranslationTarget(null)}
      />
    </>
  );
}
