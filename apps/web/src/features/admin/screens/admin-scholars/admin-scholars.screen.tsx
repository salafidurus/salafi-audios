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
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./admin-scholars.screen.module.css";

function getScholarScreenCopy(
  isDesktop: boolean,
  searchQuery: string,
  t: ReturnType<typeof useTranslation>["t"],
) {
  return {
    title: isDesktop
      ? t("admin.scholars.manageTitle", "Manage Scholars")
      : t("navigation.admin.scholars", "Scholars"),
    addLabel: isDesktop ? t("admin.scholars.addScholar", "Add Scholar") : t("common.add", "Add"),
    searchPlaceholder: isDesktop
      ? t("admin.scholars.searchPlaceholderDesktop", "Search scholars by name or slug...")
      : t("scholarContent.searchScholars", "Search scholars..."),
    emptyMessage: searchQuery
      ? t("scholarContent.searchNoMatch", "No scholars match your search.")
      : t("scholarContent.noScholarsFound", "No scholars found."),
  };
}

function AdminScholarsHeader({
  copy,
  isDesktop,
  canCreate,
  searchQuery,
  onSearchChange,
  onAdd,
}: {
  copy: ReturnType<typeof getScholarScreenCopy>;
  isDesktop: boolean;
  canCreate: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <PageHeader
        title={copy.title}
        actions={
          canCreate && (
            <Button
              variant="primary"
              size={isDesktop ? "md" : "sm"}
              icon={<Plus size={isDesktop ? 18 : 16} />}
              onClick={onAdd}
            >
              {copy.addLabel}
            </Button>
          )
        }
      />
      <div className={styles.toolbar}>
        <Search.Bar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={copy.searchPlaceholder}
        />
      </div>
    </>
  );
}

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
  const copy = getScholarScreenCopy(isDesktop, searchQuery, t);

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
            <AdminScholarsHeader
              copy={copy}
              isDesktop={isDesktop}
              canCreate={ability.can("create", "Scholar")}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAdd={handleOpenAdd}
            />
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
              emptyMessage={copy.emptyMessage}
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
