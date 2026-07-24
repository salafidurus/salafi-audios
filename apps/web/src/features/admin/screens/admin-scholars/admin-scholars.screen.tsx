"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@sd/core-contracts";
import { useInfiniteAdminScholars } from "@sd/domain-content";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { type CreateScholarDto, type AdminScholarListItemDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { Scholar } from "@/features/admin/components/Scholar";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import styles from "./admin-scholars.screen.module.css";

export function AdminScholarsScreen() {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarId, setEditingScholarId] = useState<string | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
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

  const handleSave = async (formData: CreateScholarDto) => {
    if (editingScholarId) {
      await updateScholar(editingScholarId, formData);
    } else {
      await createScholar(formData);
    }
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
                <PermissionGate requires="SCHOLARS_CREATE">
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
                </PermissionGate>
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
              hasMore={hasNextPage ?? false}
              onLoadMore={() => fetchNextPage()}
              isFetchingNextPage={isFetchingNextPage}
              renderItem={(scholar) => (
                <Scholar.Item scholar={scholar} onEdit={() => handleOpenEdit(scholar)} />
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
        scholarId={editingScholarId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingScholarId(null);
        }}
        onSave={handleSave}
      />
    </ScreenView>
  );
}
