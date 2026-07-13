"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { Search } from "@/shared/components/Search";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { CreateScholarDto, AdminScholarListItemDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { Scholar, type ScholarForEdit } from "@/features/admin/components/Scholar";
import styles from "./admin-scholars.screen.module.css";

export function AdminScholarsScreen() {
  const isDesktop = useIsDesktop();
  const { data, isFetching, refetch } = useApiQuery<AdminScholarListItemDto[]>(
    queryKeys.admin.scholars.list(),
    () =>
      httpClient<AdminScholarListItemDto[]>({
        url: endpoints.admin.scholars.list,
        method: "GET",
      }),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarForEdit | null>(null);

  const scholars = data ?? [];

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

        {filteredScholars.length > 0 ? (
          <List>
            {filteredScholars.map((scholar) => (
              <Scholar.Item
                key={scholar.id}
                scholar={scholar}
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

      <Scholar.Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        scholar={editingScholar}
      />
    </ScreenView>
  );
}
