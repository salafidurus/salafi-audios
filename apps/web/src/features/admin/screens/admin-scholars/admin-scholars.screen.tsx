"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { Search } from "@/shared/components/Search";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, CreateScholarDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { ScholarItem } from "@/features/admin/components/ScholarItem";
import {
  ScholarFormModal,
  type ScholarForEdit,
} from "@/features/admin/components/ScholarFormModal";
import styles from "./admin-scholars.screen.module.css";

interface ScholarsListResponse {
  scholars: ScholarListItemDto[];
}

export function AdminScholarsScreen() {
  const { isMobile } = useResponsive();
  const { data, isFetching, refetch } = useApiQuery<ScholarsListResponse>(
    queryKeys.scholars.list(),
    () => httpClient<ScholarsListResponse>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarForEdit | null>(null);

  const scholars = data?.scholars ?? [];

  const filteredScholars = !searchQuery.trim()
    ? scholars
    : scholars.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      );

  const handleOpenAdd = () => {
    setEditingScholar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scholar: ScholarListItemDto) => {
    setEditingScholar({
      id: scholar.id,
      name: scholar.name,
      slug: scholar.slug,
      imageUrl: scholar.imageUrl,
      isKibar: scholar.isKibar,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (formData: CreateScholarDto) => {
    if (editingScholar) {
      await updateScholar(editingScholar.id, formData);
    } else {
      await createScholar(formData);
    }
    refetch();
  };

  if (isFetching && !data) {
    return (
      <ScreenView>
        <div className={styles.loading}>Loading scholars...</div>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.container}>
        <PageHeader
          title={!isMobile ? "Manage Scholars" : "Scholars"}
          actions={
            <Button
              variant="primary"
              size={!isMobile ? "md" : "sm"}
              icon={<Plus size={!isMobile ? 18 : 16} />}
              onClick={handleOpenAdd}
            >
              {!isMobile ? "Add Scholar" : "Add"}
            </Button>
          }
        />

        <div className={styles.toolbar}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={!isMobile ? "Search scholars by name or slug..." : "Search scholars..."}
          />
        </div>

        {filteredScholars.length > 0 ? (
          <List>
            {filteredScholars.map((scholar) => (
              <ScholarItem
                key={scholar.id}
                id={scholar.id}
                name={scholar.name}
                slug={scholar.slug}
                isKibar={scholar.isKibar ?? false}
                lectureCount={scholar.lectureCount ?? 0}
                imageUrl={scholar.imageUrl ?? undefined}
                onEdit={() => handleOpenEdit(scholar)}
              />
            ))}
          </List>
        ) : (
          <div className={styles.empty}>
            {searchQuery ? "No scholars match your search." : "No scholars yet."}
          </div>
        )}
      </div>

      <ScholarFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        scholar={editingScholar}
      />
    </ScreenView>
  );
}
