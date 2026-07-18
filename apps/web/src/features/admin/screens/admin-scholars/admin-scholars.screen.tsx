"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useInfiniteAdminScholars } from "@sd/domain-content";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { type CreateScholarDto, type AdminScholarListItemDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { Scholar, type ScholarForEdit } from "@/features/admin/components/Scholar";
import styles from "./admin-scholars.screen.module.css";

export function AdminScholarsScreen() {
  const isDesktop = useIsDesktop();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarForEdit | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteAdminScholars({
      search: searchQuery,
    });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const handleOpenAdd = () => {
    setEditingScholar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scholar: AdminScholarListItemDto) => {
    setEditingScholar({
      id: scholar.id,
      name: scholar.name,
      slug: scholar.slug,
      bio: scholar.bio,
      imageUrl: scholar.imageUrl,
      isKibar: scholar.isKibar,
      isActive: scholar.isActive,
      country: scholar.country,
      mainLanguage: scholar.mainLanguage ?? "ar",
      socialTwitter: scholar.socialTwitter,
      socialTelegram: scholar.socialTelegram,
      socialYoutube: scholar.socialYoutube,
      socialWebsite: scholar.socialWebsite,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (formData: CreateScholarDto) => {
    if (editingScholar) {
      await updateScholar(editingScholar.id, formData);
    } else {
      await createScholar(formData);
    }
    setIsModalOpen(false);
    setEditingScholar(null);
  };

  return (
    <ScreenView>
      <div className={styles.container}>
        <PageHeader
          title={isDesktop ? "Manage Scholars" : "Scholars"}
          actions={
            <PermissionGate requires="SCHOLARS_CREATE">
              <Button
                variant="primary"
                size={isDesktop ? "md" : "sm"}
                icon={<Plus size={isDesktop ? 18 : 16} />}
                onClick={handleOpenAdd}
              >
                {isDesktop ? "Add Scholar" : "Add"}
              </Button>
            </PermissionGate>
          }
        />

        <div className={styles.toolbar}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={isDesktop ? "Search scholars by name or slug..." : "Search scholars..."}
          />
        </div>

        <InfiniteScrollList
          data={allItems}
          isLoading={isLoading}
          hasMore={hasNextPage ?? false}
          onLoadMore={() => fetchNextPage()}
          isFetchingNextPage={isFetchingNextPage}
          renderItem={(scholar) => (
            <Scholar.Row scholar={scholar} onEdit={() => handleOpenEdit(scholar)} />
          )}
          emptyMessage={searchQuery ? "No scholars match your search." : "No scholars found."}
        />
      </div>

      {isModalOpen && (
        <Scholar.Modal
          scholar={editingScholar}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingScholar(null);
          }}
          onSave={handleSave}
        />
      )}
    </ScreenView>
  );
}
