"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic } from "@/features/admin/api/admin.api";
import {
  AdminContentsTabs,
  type AdminContentsTab,
} from "@/features/admin/components/AdminContentsTabs";
import { AdminSearchBar } from "@/features/admin/components/AdminSearchBar";
import { TopicFormModal, type TopicForEdit } from "@/features/admin/components/TopicFormModal";
import styles from "./admin-contents.screen.mobile.module.css";

export function AdminContentsMobileScreen() {
  const [activeTab, setActiveTab] = useState<AdminContentsTab>("topics");
  const [searchQuery, setSearchQuery] = useState("");

  // Topics state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicForEdit | null>(null);

  // Fetch topics
  const { data: topicsData, refetch: refetchTopics } = useApiQuery<TopicDetailDto[]>(
    queryKeys.topics.list(),
    () => httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  const topics = topicsData ?? [];

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
              Add Topic
            </Button>
          ) : (
            <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => {}}>
              Add Listing
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
        <div className={styles.listingsInfo}>
          <p>See the Lectures section for full listing management.</p>
        </div>
      )}

      {/* Topic Modal */}
      <TopicFormModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        topic={editingTopic}
      />
    </ScreenView>
  );
}
