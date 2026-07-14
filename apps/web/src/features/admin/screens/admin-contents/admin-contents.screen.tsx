"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { List } from "@/shared/components/List";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  TopicDetailDto,
  AdminListingListItemDto,
  AdminListingDetailDto,
  AdminListingListDto,
} from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic } from "@/features/admin/api/admin.api";
import {
  fetchAdminLectures,
  fetchAdminLectureDetail,
} from "@/features/admin/api/admin-lectures.api";
import { Content } from "@/features/admin/components/Content";
import type { TopicForEdit } from "@/features/admin/components/Content/TopicModal";
import { AudioUploader } from "@/features/admin/components/AudioUploader/AudioUploader";
import { Modal } from "@/shared/components/Modal";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { sanitizeError } from "@sd/utils-error";
import styles from "./admin-contents.screen.module.css";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];
const EMPTY_LISTINGS_ARRAY: AdminListingListItemDto[] = [];

export function AdminContentsScreen() {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Derive active tab from URL pathname
  const activeTab = pathname.includes("/listings") ? "listings" : "topics";

  // Topics state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicForEdit | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTopicName, setDeletingTopicName] = useState<string>("");
  // react-doctor-disable-next-line react-doctor/rerender-state-only-in-handlers
  const [deletingTopicSlug, setDeletingTopicSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Listings state
  const [isAudioUploaderOpen, setIsAudioUploaderOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListingDetailDto | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<AudioData | null>(null);

  // Fetch topics
  const { data: topicsData, refetch: refetchTopics } = useApiQuery<TopicDetailDto[]>(
    queryKeys.topics.list(),
    () => httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  const topics = topicsData ?? EMPTY_TOPICS_ARRAY;

  // Fetch listings
  const { data: listingsData, refetch: refetchListings } = useApiQuery<AdminListingListDto>(
    ["admin", "listings", "list", { search: searchQuery }],
    () => fetchAdminLectures({ search: searchQuery, page: 1, limit: 100 }),
    { enabled: activeTab === "listings" },
  );

  const listings = listingsData?.items ?? EMPTY_LISTINGS_ARRAY;

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.en.toLowerCase().includes(query) ||
        (t.name.ar && t.name.ar.toLowerCase().includes(query)) ||
        t.slug.toLowerCase().includes(query),
    );
  }, [topics, searchQuery]);

  // Topic handlers
  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicDetailDto) => {
    setEditingTopic({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      parentSlug: undefined, // parentId from API doesn't map to parentSlug
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (formData: any) => {
    if (editingTopic) {
      await updateTopic(editingTopic.slug, formData);
    } else {
      await createTopic(formData);
    }
    refetchTopics();
  };

  const handleDeleteClick = (slug: string, name: string) => {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeletingTopicSlug(slug);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeletingTopicName(name);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeleteError(null);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopicSlug) return;
    try {
      await deleteTopic(deletingTopicSlug);
      setDeleteModalOpen(false);
      setDeletingTopicSlug(null);
      setDeletingTopicName("");
      setDeleteError(null);
      refetchTopics();
    } catch (err) {
      setDeleteError(sanitizeError(err));
    }
  };

  // Listing handlers
  const handleOpenAddListing = () => {
    setIsAudioUploaderOpen(true);
  };

  const handleUploadComplete = (audioInfo: AudioData | null) => {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setInitialAudioData(audioInfo);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setSelectedListing(null);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setIsAudioUploaderOpen(false);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setIsListingModalOpen(true);
  };

  const handleEditListing = async (listingId: string) => {
    try {
      const details = await fetchAdminLectureDetail(listingId);
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setSelectedListing(details);
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setInitialAudioData(null);
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setIsListingModalOpen(true);
    } catch {
      // Stay on current view
    }
  };

  const handleListingSaved = () => {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setIsListingModalOpen(false);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setSelectedListing(null);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setInitialAudioData(null);
    refetchListings();
  };

  return (
    <ScreenView>
      <Modal.ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingTopicSlug(null);
          setDeletingTopicName("");
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Topic?"
        confirmLabel="Delete Topic"
        confirmVariant="danger"
      >
        <p>
          Are you sure you want to delete the topic <strong>{deletingTopicName}</strong>?
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
          This action cannot be undone.
        </p>
        {deleteError && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-danger)", marginTop: "0.5rem" }}>
            {deleteError}
          </p>
        )}
      </Modal.ConfirmDialog>

      <PageHeader
        title={isMobile ? "Content" : "Content Management"}
        actions={
          activeTab === "topics" ? (
            <PermissionGate requires="TOPICS_CREATE">
              <Button
                variant="primary"
                size={!isMobile ? "md" : "sm"}
                icon={<Plus size={!isMobile ? 18 : 16} />}
                onClick={handleOpenAddTopic}
              >
                {!isMobile ? "Add Topic" : "Topic"}
              </Button>
            </PermissionGate>
          ) : (
            <PermissionGate requires="LISTINGS_CREATE">
              <Button
                variant="primary"
                size={!isMobile ? "md" : "sm"}
                icon={<Plus size={!isMobile ? 18 : 16} />}
                onClick={handleOpenAddListing}
              >
                {!isMobile ? "Add Listing" : "Listing"}
              </Button>
            </PermissionGate>
          )
        }
      />

      <div className={styles.content}>
        <Search.Bar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={activeTab === "topics" ? "Search topics..." : "Search listings..."}
        />

        {activeTab === "topics" && (
          <>
            {filteredTopics.length > 0 ? (
              <List>
                {filteredTopics.map((topic) => (
                  <Content.Topic
                    key={topic.slug}
                    topic={topic}
                    onEdit={handleOpenEditTopic}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </List>
            ) : (
              <div className={styles.empty}>
                {searchQuery ? "No topics match your search." : "No topics yet."}
              </div>
            )}
          </>
        )}

        {activeTab === "listings" && (
          <>
            {listings.length > 0 ? (
              <List>
                {listings.map((listing) => (
                  <Content.Listing key={listing.id} listing={listing} onEdit={handleEditListing} />
                ))}
              </List>
            ) : (
              <div className={styles.empty}>
                {searchQuery
                  ? "No listings match your search."
                  : "No listings yet. Add audio to create a listing."}
              </div>
            )}
          </>
        )}
      </div>

      {/* Topic Modal */}
      <Content.TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        topic={editingTopic}
      />

      {/* Audio Uploader */}
      {isAudioUploaderOpen && <AudioUploader onUploadComplete={handleUploadComplete} />}

      {/* Listing Modal */}
      <Content.ListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSuccess={handleListingSaved}
        listing={selectedListing}
        initialAudioData={initialAudioData}
      />
    </ScreenView>
  );
}
