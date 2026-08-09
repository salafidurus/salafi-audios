"use client";

import { queryKeys } from "@sd/core-contracts";
import { type AdminScholarListItemDto } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { useInfiniteAdminScholars } from "@sd/domain-content";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Scholar } from "@/features/admin/components/Scholar";
import {
  TranslationModal,
  translationTargetKey,
  type ClientTranslationTarget,
} from "@/features/admin/components/Translation";
import { Button } from "@/shared/components/Button";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./admin-scholars.screen.module.css";

export function AdminScholarsScreen() {
  const isDesktop = useIsDesktop();
  const { ability } = useAbility();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarId, setEditingScholarId] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<ClientTranslationTarget | null>(null);

  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteAdminScholars({
      search: searchQuery,
    });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const handleOpenAdd = () => {
    setEditingScholarId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scholar: AdminScholarListItemDto) => {
    setEditingScholarId(scholar.id);
    setIsModalOpen(true);
  };

  const handleScholarSaved = async () => {
    // Invalidate all scholar queries to refetch updated data
    await queryClient.refetchQueries({
      queryKey: queryKeys.admin.scholars.all(),
    });
    setIsModalOpen(false);
    setEditingScholarId(null);
  };

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.container}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader
              title={
                isDesktop
                  ? t("admin.scholars.manageTitle", "Manage Scholars")
                  : t("navigation.admin.scholars", "Scholars")
              }
              actions={
                ability.can("create", "Scholar") && (
                  <Button
                    variant="primary"
                    size={isDesktop ? "md" : "sm"}
                    icon={<Plus size={isDesktop ? 18 : 16} />}
                    onClick={handleOpenAdd}
                  >
                    {isDesktop
                      ? t("admin.scholars.addScholar", "Add Scholar")
                      : t("common.add", "Add")}
                  </Button>
                )
              }
            />

            <div className={styles.toolbar}>
              <Search.Bar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  isDesktop
                    ? t(
                        "admin.scholars.searchPlaceholderDesktop",
                        "Search scholars by name or slug...",
                      )
                    : t("scholarContent.searchScholars", "Search scholars...")
                }
              />
            </div>
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            <InfiniteScrollList
              data={allItems}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              hasMore={hasNextPage ?? false}
              onLoadMore={() => fetchNextPage()}
              isFetchingNextPage={isFetchingNextPage}
              renderItem={(scholar) => (
                <Scholar.Item
                  scholar={scholar}
                  onEdit={() => handleOpenEdit(scholar)}
                  onTranslate={() =>
                    setTranslationTarget({ entity: "scholar", scholarId: scholar.id })
                  }
                />
              )}
              emptyMessage={
                searchQuery
                  ? t("scholarContent.searchNoMatch", "No scholars match your search.")
                  : t("scholarContent.noScholarsFound", "No scholars found.")
              }
            />
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
      </div>

      <ScrollToTopButton />

      <Scholar.Modal
        key={editingScholarId ?? "create"}
        scholarId={editingScholarId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingScholarId(null);
        }}
        onSuccess={handleScholarSaved}
      />

      <TranslationModal
        key={translationTargetKey(translationTarget)}
        isOpen={!!translationTarget}
        target={translationTarget}
        onClose={() => setTranslationTarget(null)}
      />
    </ScreenView>
  );
}
