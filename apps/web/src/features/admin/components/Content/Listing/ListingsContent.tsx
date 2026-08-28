"use client";

import { queryKeys, type AdminListingListItemDto } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { useInfiniteAdminListings } from "@sd/domain-content";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Languages, Pencil, Upload } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  TranslationModal,
  translationTargetKey,
  type ClientTranslationTarget,
} from "@/features/admin/components/Translation";
import styles from "@/features/admin/screens/admin-contents/admin-contents.screen.module.css";
import { AppAvatar } from "@/shared/components/app-avatar";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { Content } from "../Content";

export type ListingsContentProps = {
  debouncedSearch: string;
  isAudioUploaderOpen: boolean;
  onAudioUploaderOpenChange: (open: boolean) => void;
};

type ListingSortKey = "title" | "scholarName" | "status";
type SortDirection = "asc" | "desc";

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown aria-hidden="true" size={14} />;
  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" size={14} />
  ) : (
    <ArrowDown aria-hidden="true" size={14} />
  );
}

function DesktopListingsTable({
  listings,
  ability,
  sort,
  hasNextPage,
  isFetchingNextPage,
  onSort,
  onEdit,
  onUpload,
  onTranslate,
  onLoadMore,
  t,
}: {
  listings: AdminListingListItemDto[];
  ability: ReturnType<typeof useAbility>["ability"];
  sort: { key: ListingSortKey; direction: SortDirection };
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  onSort: (key: ListingSortKey) => void;
  onEdit: (listingId: string) => void;
  onUpload: (listingId: string) => void;
  onTranslate: (listingId: string) => void;
  onLoadMore: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const renderSortHead = (key: ListingSortKey, label: string) => {
    const active = sort.key === key;
    return (
      <TableHead
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <Button
          variant="ghost"
          size="sm"
          className={styles.tableSortButton}
          onClick={() => onSort(key)}
          aria-label={t("admin.contents.sortBy", "Sort by {{label}}", { label })}
        >
          {label}
          <SortIcon active={active} direction={sort.direction} />
        </Button>
      </TableHead>
    );
  };

  return (
    <div className={styles.desktopContentTable}>
      <Table>
        <TableHeader>
          <TableRow>
            {renderSortHead("title", t("admin.contents.listingColumn", "Listing"))}
            {renderSortHead("scholarName", t("admin.contents.scholarColumn", "Scholar"))}
            {renderSortHead("status", t("admin.contents.statusColumn", "Status"))}
            <TableHead className={styles.tableActionsColumn}>
              {t("admin.contents.actionsColumn", "Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className={styles.tablePrimaryCell}>
                <div className={styles.tableListingCell}>
                  <AppAvatar
                    listingArtwork={listing.coverImageUrl}
                    name={listing.title}
                    size={24}
                    className={styles.tableAvatar}
                  />
                  <span>{listing.title}</span>
                </div>
              </TableCell>
              <TableCell className={styles.tableMutedCell}>{listing.scholarName}</TableCell>
              <TableCell className={styles.tableMutedCell}>
                {t(`admin.contents.listing.${listing.status}`, listing.status)}
              </TableCell>
              <TableCell className={styles.tableActionsColumn}>
                <div className={styles.tableActions}>
                  {ability.can("update", "Listing") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(listing.id)}
                      aria-label={`${t("common.edit", "Edit")} ${listing.title}`}
                    >
                      <Pencil size={16} />
                    </Button>
                  )}
                  {ability.can("read", "Translation") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTranslate(listing.id)}
                      aria-label={`${t("admin.translations.button", "Translations")} ${listing.title}`}
                    >
                      <Languages size={16} />
                    </Button>
                  )}
                  {ability.can("upload", "Media") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpload(listing.id)}
                      aria-label={`${t("common.upload", "Upload")} ${listing.title}`}
                    >
                      <Upload size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div className={styles.tableLoadMore}>
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage
              ? t("common.loading", "Loading...")
              : t("common.loadMore", "Load more")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ListingsContent({
  debouncedSearch,
  isAudioUploaderOpen,
  onAudioUploaderOpenChange,
}: ListingsContentProps) {
  const { t } = useTranslation();
  const { ability } = useAbility();
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
  const [sort, setSort] = useState<{ key: ListingSortKey; direction: SortDirection }>({
    key: "title",
    direction: "asc",
  });

  const queryClient = useQueryClient();

  const allListings = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const sortedListings = useMemo(
    () =>
      [...allListings].sort((a, b) => {
        const left = String(a[sort.key] ?? "");
        const right = String(b[sort.key] ?? "");
        return (
          left.localeCompare(right, undefined, { sensitivity: "base" }) *
          (sort.direction === "asc" ? 1 : -1)
        );
      }),
    [allListings, sort],
  );

  const handleSort = (key: ListingSortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

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
      {allListings.length > 0 && (
        <DesktopListingsTable
          listings={sortedListings}
          ability={ability}
          sort={sort}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onSort={handleSort}
          onEdit={handleEditListing}
          onUpload={handleUploadListing}
          onTranslate={(id) => setTranslationTarget({ entity: "listing", listingId: id })}
          onLoadMore={() => void fetchNextPage()}
          t={t}
        />
      )}
      <div className={styles.mobileContentList}>
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
              : t(
                  "admin.contents.noListingsFound",
                  "No listings yet. Add a listing to get started.",
                )
          }
        />
      </div>

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
