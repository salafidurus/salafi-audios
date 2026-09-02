/** Documents this module's responsibility and public boundary. */
"use client";

import { queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { useAbility } from "@sd/domain-account";
import { sanitizeError } from "@sd/utils-error";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Languages, Pencil, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { deleteTopic } from "@/features/admin/api/admin.api";
import {
  TranslationModal,
  translationTargetKey,
  type ClientTranslationTarget,
} from "@/features/admin/components/Translation";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import styles from "../../../screens/admin-contents/admin-contents.screen.module.css";
import { Content } from "../Content";

export type TopicsContentProps = {
  searchQuery: string;
  debouncedSearch: string;
  topics: TopicDetailDto[];
  onEditTopic: (topic: TopicDetailDto) => void;
};

type TopicSortKey = "name" | "slug" | "orderIndex";
type SortDirection = "asc" | "desc";

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown aria-hidden="true" size={14} />;
  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" size={14} />
  ) : (
    <ArrowDown aria-hidden="true" size={14} />
  );
}

export function TopicsContent({
  searchQuery,
  debouncedSearch,
  topics,
  onEditTopic,
}: TopicsContentProps) {
  const { i18n, t } = useTranslation();
  const { ability } = useAbility();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTopicName, setDeletingTopicName] = useState<string>("");
  const deletingTopicSlugRef = useRef<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<ClientTranslationTarget | null>(null);
  const [sort, setSort] = useState<{ key: TopicSortKey; direction: SortDirection }>({
    key: "orderIndex",
    direction: "asc",
  });
  const queryClient = useQueryClient();

  const filteredTopics = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return topics;
    }
    const query = debouncedSearch.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.ar.toLowerCase().includes(query) ||
        (t.name.en && t.name.en.toLowerCase().includes(query)) ||
        t.slug.toLowerCase().includes(query),
    );
  }, [topics, debouncedSearch]);

  const sortedTopics = useMemo(
    () =>
      [...filteredTopics].sort((a, b) => {
        if (sort.key === "orderIndex") {
          return (a.orderIndex - b.orderIndex) * (sort.direction === "asc" ? 1 : -1);
        }
        const left = sort.key === "name" ? getLocalizedName(a.name, i18n.language) : a.slug;
        const right = sort.key === "name" ? getLocalizedName(b.name, i18n.language) : b.slug;
        return (
          left.localeCompare(right, undefined, { sensitivity: "base" }) *
          (sort.direction === "asc" ? 1 : -1)
        );
      }),
    [filteredTopics, i18n.language, sort],
  );

  const handleSort = (key: TopicSortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortHead = (key: TopicSortKey, label: string) => {
    const active = sort.key === key;
    return (
      <TableHead
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <Button
          variant="ghost"
          size="sm"
          className={styles.tableSortButton}
          onClick={() => handleSort(key)}
          aria-label={t("admin.contents.sortBy", "Sort by {{label}}", { label })}
        >
          {label}
          <SortIcon active={active} direction={sort.direction} />
        </Button>
      </TableHead>
    );
  };

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
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.topics.all }),
        queryClient.refetchQueries({ queryKey: queryKeys.admin.topics.all() }),
      ]);
      setDeleteModalOpen(false);
      deletingTopicSlugRef.current = null;
      setDeletingTopicName("");
      setDeleteError(null);
    } catch (err) {
      setDeleteError(sanitizeError(err));
    }
  };

  const topicTable = filteredTopics.length > 0 && (
    <div className={styles.desktopContentTable}>
      <Table>
        <TableHeader>
          <TableRow>
            {renderSortHead("name", t("admin.contents.topicColumn", "Topic"))}
            {renderSortHead("slug", t("admin.contents.slugColumn", "Slug"))}
            {renderSortHead("orderIndex", t("admin.contents.orderColumn", "Order"))}
            <TableHead className={styles.tableActionsColumn}>
              {t("admin.contents.actionsColumn", "Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTopics.map((topic) => {
            const displayName = getLocalizedName(topic.name, i18n.language);
            return (
              <TableRow key={topic.slug}>
                <TableCell className={styles.tablePrimaryCell}>{displayName}</TableCell>
                <TableCell className={styles.tableMutedCell}>{topic.slug}</TableCell>
                <TableCell className={styles.tableMutedCell}>{topic.orderIndex}</TableCell>
                <TableCell className={styles.tableActionsColumn}>
                  <div className={styles.tableActions}>
                    {ability.can("update", "Topic") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTopic(topic)}
                        aria-label={`${t("common.edit", "Edit")} ${displayName}`}
                      >
                        <Pencil size={16} />
                      </Button>
                    )}
                    {ability.can("read", "Translation") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setTranslationTarget({
                            entity: "topic",
                            topicId: topic.id,
                            topicSlug: topic.slug,
                          })
                        }
                        aria-label={`${t("admin.translations.button", "Translations")} ${displayName}`}
                      >
                        <Languages size={16} />
                      </Button>
                    )}
                    {ability.can("delete", "Topic") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(topic.slug, displayName)}
                        aria-label={`${t("common.delete", "Delete")} ${displayName}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <ConfirmationDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (open) return;
          setDeleteModalOpen(false);
          deletingTopicSlugRef.current = null;
          setDeletingTopicName("");
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("admin.contents.deleteTitle", "Delete Topic?")}
        confirmLabel={t("admin.contents.deleteConfirm", "Delete Topic")}
        variant="destructive"
        error={deleteError}
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
      </ConfirmationDialog>

      {filteredTopics.length > 0 ? (
        <>
          {topicTable}
          <div className={styles.mobileContentList}>
            <List>
              {filteredTopics.map((topic) => (
                <Content.Topic
                  key={topic.slug}
                  topic={topic}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteClick}
                  onTranslate={(t) =>
                    setTranslationTarget({ entity: "topic", topicId: t.id, topicSlug: t.slug })
                  }
                />
              ))}
            </List>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          {searchQuery
            ? t("admin.contents.searchNoMatchTopics", "No topics match your search.")
            : t("admin.contents.noTopicsFound", "No topics yet.")}
        </div>
      )}

      <TranslationModal
        key={translationTargetKey(translationTarget)}
        isOpen={!!translationTarget}
        target={translationTarget}
        onClose={() => setTranslationTarget(null)}
      />
    </>
  );
}
