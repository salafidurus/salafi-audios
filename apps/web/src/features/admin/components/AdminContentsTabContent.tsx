"use client";

import { useState, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, type TopicDetailDto, type AdminListingDetailDto } from "@sd/core-contracts";
import { useInfiniteAdminListings, useApiQuery, httpClient, endpoints } from "@sd/domain-content";
import { List } from "@/shared/components/List";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/core/i18n/use-translation";
import { sanitizeError } from "@sd/utils-error";
import { Content } from "./Content";
import type { TopicForEdit } from "./Content/TopicModal";
import { AudioUploader } from "./AudioUploader/AudioUploader";
import { createTopic, updateTopic, deleteTopic } from "../api/admin.api";
import { fetchAdminLectureDetail } from "../api/admin-lectures.api";
import styles from "../screens/admin-contents/admin-contents.screen.module.css";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

export type TopicsContentProps = {
  searchQuery: string;
  debouncedSearch: string;
  isMobile: boolean;
  topics: TopicDetailDto[];
};

export function TopicsContent({
  searchQuery,
  debouncedSearch,
  isMobile,
  topics,
}: TopicsContentProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicForEdit | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTopicName, setDeletingTopicName] = useState<string>("");
  const deletingTopicSlugRef = useRef<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const filteredTopics = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return topics;
    }
    const query = debouncedSearch.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.en.toLowerCase().includes(query) ||
        (t.name.ar && t.name.ar.toLowerCase().includes(query)) ||
        t.slug.toLowerCase().includes(query),
    );
  }, [topics, debouncedSearch]);

  const handleOpenEdit = (topic: TopicDetailDto) => {
    setEditingTopic({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (editingTopic) {
      await updateTopic(editingTopic.slug, formData);
    } else {
      await createTopic(formData);
    }
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
  };

  const handleDeleteClick = (slug: string, name: string) => {
    deletingTopicSlugRef.current = slug;
    setDeletingTopicName(name);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopicSlugRef.current) return;
    try {
      await deleteTopic(deletingTopicSlugRef.current);
      setDeleteModalOpen(false);
      deletingTopicSlugRef.current = null;
      setDeletingTopicName("");
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    } catch (err) {
      setDeleteError(sanitizeError(err));
    }
  };

  return (
    <>
      <Modal.ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          deletingTopicSlugRef.current = null;
          setDeletingTopicName("");
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("admin.contents.deleteTitle", "Delete Topic?")}
        confirmLabel={t("admin.contents.deleteConfirm", "Delete Topic")}
        confirmVariant="danger"
      >
        <p>
          {t("admin.contents.deletePrompt", {
            defaultValue: "Are you sure you want to delete the topic {{name}}?",
            name: deletingTopicName,
          })}
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
          {t("admin.contents.deleteWarning", "This action cannot be undone.")}
        </p>
        {deleteError && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-danger)", marginTop: "0.5rem" }}>
            {deleteError}
          </p>
        )}
      </Modal.ConfirmDialog>

      {filteredTopics.length > 0 ? (
        <List>
          {filteredTopics.map((topic) => (
            <Content.Topic
              key={topic.slug}
              topic={topic}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </List>
      ) : (
        <div className={styles.empty}>
          {searchQuery
            ? t("admin.contents.searchNoMatchTopics", "No topics match your search.")
            : t("admin.contents.noTopicsFound", "No topics yet.")}
        </div>
      )}

      <Content.TopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        topic={editingTopic}
      />
    </>
  );
}

export type ListingsContentProps = {
  debouncedSearch: string;
  isMobile: boolean;
};

export function ListingsContent({ debouncedSearch, isMobile }: ListingsContentProps) {
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
