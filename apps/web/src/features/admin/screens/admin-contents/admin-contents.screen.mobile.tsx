"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
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
import {
  AdminContentsTabs,
  type AdminContentsTab,
} from "@/features/admin/components/AdminContentsTabs";
import { AdminSearchBar } from "@/features/admin/components/AdminSearchBar";
import { TopicFormModal, type TopicForEdit } from "@/features/admin/components/TopicFormModal";
import { AudioUploader } from "@/features/admin/components/AudioUploader/AudioUploader";
import { LectureEditModal } from "@/features/admin/components/LectureEditModal";
import styles from "./admin-contents.screen.mobile.module.css";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

export function AdminContentsMobileScreen() {
  const [activeTab, setActiveTab] = useState<AdminContentsTab>("topics");
  const [searchQuery, setSearchQuery] = useState("");

  // Topics state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicForEdit | null>(null);

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

  const topics = topicsData ?? [];

  // Fetch listings
  const { data: listingsData, refetch: refetchListings } = useApiQuery<AdminListingListDto>(
    ["admin", "listings", "list", { search: searchQuery }],
    () => fetchAdminLectures({ search: searchQuery, page: 1, limit: 100 }),
    { enabled: activeTab === "listings" },
  );

  const listings = listingsData?.items ?? [];

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

  const handleDeleteTopic = async (slug: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      await deleteTopic(slug);
      refetchTopics();
    }
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
      <PageHeader
        title="Content"
        actions={
          activeTab === "topics" ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={handleOpenAddTopic}
            >
              Topic
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={handleOpenAddListing}
            >
              Listing
            </Button>
          )
        }
      />

      <AdminContentsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AdminSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={() => {}}
        placeholder={activeTab === "topics" ? "Search topics..." : "Search listings..."}
      />

      {activeTab === "topics" && (
        <div className={styles.topicsList}>
          {filteredTopics.map((topic) => (
            <div key={topic.slug} className={styles.topicItem}>
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
                  onClick={() => handleDeleteTopic(topic.slug)}
                />
              </div>
            </div>
          ))}
          {filteredTopics.length === 0 && (
            <div className={styles.empty}>
              {searchQuery ? "No topics match your search." : "No topics yet."}
            </div>
          )}
        </div>
      )}

      {activeTab === "listings" && (
        <div className={styles.listingsList}>
          {listings.map((listing) => (
            <div key={listing.id} className={styles.listingItem}>
              <div className={styles.listingInfo}>
                <span className={styles.listingTitle}>{listing.title}</span>
                <span className={styles.listingMeta}>
                  {listing.scholarName} • {listing.status}
                </span>
              </div>
              <div className={styles.listingActions}>
                <Button variant="ghost" size="sm" onClick={() => handleEditListing(listing.id)}>
                  <Edit size={14} />
                </Button>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className={styles.empty}>
              {searchQuery
                ? "No listings match your search."
                : "No listings yet. Add audio to create a listing."}
            </div>
          )}
        </div>
      )}

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
