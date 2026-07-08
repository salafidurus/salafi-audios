"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, CreateScholarDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { AdminSearchBar } from "@/features/admin/components/AdminSearchBar";
import { ScholarCard } from "@/features/admin/components/ScholarCard";
import {
  ScholarFormModal,
  type ScholarForEdit,
} from "@/features/admin/components/ScholarFormModal";
import styles from "./admin-scholars.screen.mobile.module.css";

interface ScholarsListResponse {
  scholars: ScholarListItemDto[];
}

export function AdminScholarsMobileScreen() {
  const { data, isFetching, refetch } = useApiQuery<ScholarsListResponse>(
    queryKeys.scholars.list(),
    () => httpClient<ScholarsListResponse>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarForEdit | null>(null);

  const scholars = data?.scholars ?? [];

  const filteredScholars = useMemo(() => {
    if (!searchQuery.trim()) return scholars;
    const query = searchQuery.toLowerCase();
    return scholars.filter(
      (s) => s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query),
    );
  }, [scholars, searchQuery]);

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
      // Update existing scholar
      await updateScholar(editingScholar.id, formData);
    } else {
      // Create new scholar
      await createScholar(formData);
    }
    // Refetch the list after save
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
          title="Scholars"
          actions={
            <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAdd}>
              Add
            </Button>
          }
        />

        <div className={styles.toolbar}>
          <AdminSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
            placeholder="Search scholars..."
          />
        </div>

        <div className={styles.list}>
          {filteredScholars.map((scholar) => (
            <ScholarCard
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
        </div>

        {filteredScholars.length === 0 && (
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
