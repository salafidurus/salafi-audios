"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Plus, Trash2, Edit } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  TopicDetailDto,
  AdminListingDetailDto,
  AdminListingListDto,
} from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic } from "@/features/admin/api/admin.api";
import {
  fetchAdminLectures,
  fetchAdminLectureDetail,
} from "@/features/admin/api/admin-lectures.api";
import { List } from "@/shared/components/List";
import { TopicFormModal, type TopicForEdit } from "@/features/admin/components/TopicFormModal";
import { AudioUploader } from "@/features/admin/components/AudioUploader/AudioUploader";
import { LectureEditModal } from "@/features/admin/components/LectureEditModal";
import { DeleteTopicConfirmModal } from "@/shared/components/DeleteTopicConfirmModal";
import { useResponsive } from "@/shared/hooks/use-responsive";
import styles from "./admin-contents.screen.module.css";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];
const EMPTY_LISTINGS_ARRAY: AdminListingDetailDto[] = [];

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
  const [deletingTopicSlug, setDeletingTopicSlug] = useState<string | null>(null);
  const [deletingTopicName, setDeletingTopicName] = useState<string>("");

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
      (t) => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query),
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
    setDeletingTopicSlug(slug);
    setDeletingTopicName(name);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopicSlug) return;
    await deleteTopic(deletingTopicSlug);
    setDeleteModalOpen(false);
    setDeletingTopicSlug(null);
    setDeletingTopicName("");
    refetchTopics();
  };

  // Listing handlers
  const handleOpenAddListing = () => {
    setIsAudioUploaderOpen(true);
  };

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
    refetchListings();
  };

  return (
    <ScreenView>
      <DeleteTopicConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingTopicSlug(null);
          setDeletingTopicName("");
        }}
        onConfirm={handleConfirmDelete}
        topicName={deletingTopicName}
      />

      <PageHeader
        title={isMobile ? "Content" : "Content Management"}
        actions={
          activeTab === "topics" ? (
            <Button
              variant="primary"
              size={!isMobile ? "md" : "sm"}
              icon={<Plus size={!isMobile ? 18 : 16} />}
              onClick={handleOpenAddTopic}
            >
              {!isMobile ? "Add Topic" : "Topic"}
            </Button>
          ) : (
            <Button
              variant="primary"
              size={!isMobile ? "md" : "sm"}
              icon={<Plus size={!isMobile ? 18 : 16} />}
              onClick={handleOpenAddListing}
            >
              {!isMobile ? "Add Listing" : "Listing"}
            </Button>
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
                  <List.Item key={topic.slug} interactive className={styles.topicItem}>
                    <div className={styles.topicInfo}>
                      <span className={styles.topicName}>{topic.name}</span>
                      <span className={styles.topicSlug}>{topic.slug}</span>
                    </div>
                    <div className={styles.topicActions}>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditTopic(topic)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteClick(topic.slug, topic.name)}
                      />
                    </div>
                  </List.Item>
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
                  <List.Item key={listing.id} interactive className={styles.listingItem}>
                    <div className={styles.listingInfo}>
                      <span className={styles.listingTitle}>{listing.title}</span>
                      <span className={styles.listingMeta}>
                        {listing.scholarName} • {listing.status}
                      </span>
                    </div>
                    <div className={styles.listingActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditListing(listing.id)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  </List.Item>
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
      <TopicFormModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        topic={editingTopic}
      />

      {/* Audio Uploader */}
      {isAudioUploaderOpen && <AudioUploader onUploadComplete={handleUploadComplete} />}

      {/* Listing Modal */}
      <LectureEditModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSuccess={handleListingSaved}
        lecture={selectedListing}
        initialAudioData={initialAudioData}
      />
    </ScreenView>
  );
}
