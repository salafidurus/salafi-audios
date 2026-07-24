"use client";

import { useState, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { List } from "@/shared/components/List";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/core/i18n/use-translation";
import { sanitizeError } from "@sd/utils-error";
import { Content } from "../Content";
import { deleteTopic } from "@/features/admin/api/admin.api";
import styles from "../../../screens/admin-contents/admin-contents.screen.module.css";

export type TopicsContentProps = {
  searchQuery: string;
  debouncedSearch: string;
  topics: TopicDetailDto[];
  onEditTopic: (topic: TopicDetailDto) => void;
};

export function TopicsContent({
  searchQuery,
  debouncedSearch,
  topics,
  onEditTopic,
}: TopicsContentProps) {
  const { t } = useTranslation();
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
    onEditTopic(topic);
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
      await queryClient.refetchQueries({ queryKey: queryKeys.topics.all });
      setDeleteModalOpen(false);
      deletingTopicSlugRef.current = null;
      setDeletingTopicName("");
      setDeleteError(null);
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
    </>
  );
}
